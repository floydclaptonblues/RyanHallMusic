(() => {
  const canvas = document.getElementById('world-canvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'high-performance' });
  if (!gl) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  const vertexSource = `
    precision highp float;
    attribute vec3 a_position;
    attribute vec3 a_color;
    attribute vec3 a_normal;
    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform float u_time;
    uniform float u_wave;
    varying vec3 v_color;
    varying float v_depth;
    varying vec3 v_world;
    varying vec3 v_normal;
    varying float v_waveHeight;
    void main() {
      vec3 p = a_position;
      vec3 n = a_normal;
      float waveHeight = 0.0;
      if (u_wave > 0.5) {
        float w1 = sin(p.x * 0.62 + u_time * 0.48) * 0.055;
        float w2 = cos(p.z * 0.43 - u_time * 0.37) * 0.042;
        float w3 = sin((p.x + p.z) * 0.21 + u_time * 0.22) * 0.028;
        waveHeight = w1 + w2 + w3;
        p.y += waveHeight;
        n = normalize(vec3(
          -0.034 * cos(p.x * 0.62 + u_time * 0.48) - 0.006 * cos((p.x + p.z) * 0.21 + u_time * 0.22),
          1.0,
          0.018 * sin(p.z * 0.43 - u_time * 0.37) - 0.006 * cos((p.x + p.z) * 0.21 + u_time * 0.22)
        ));
      }
      vec4 viewPosition = u_view * vec4(p, 1.0);
      gl_Position = u_projection * viewPosition;
      v_color = a_color;
      v_depth = -viewPosition.z;
      v_world = p;
      v_normal = n;
      v_waveHeight = waveHeight;
    }
  `;

  const fragmentSource = `
    precision highp float;
    uniform float u_wave;
    uniform float u_time;
    uniform float u_alpha;
    varying vec3 v_color;
    varying float v_depth;
    varying vec3 v_world;
    varying vec3 v_normal;
    varying float v_waveHeight;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), f.x), mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x), f.y);
    }

    void main() {
      vec3 normal = normalize(v_normal);
      vec3 lightDir = normalize(vec3(-0.42, 0.82, 0.36));
      float diffuse = max(dot(normal, lightDir), 0.0);
      float halfLight = max(dot(normal, normalize(lightDir + vec3(0.0, .55, .8))), 0.0);
      vec3 col;

      if (u_wave > 0.5) {
        float deep = smoothstep(-4.0, 34.0, v_world.x);
        float ripples = noise(v_world.xz * 1.25 + vec2(u_time * .025, -u_time * .018));
        float lineGlint = pow(max(0.0, sin(v_world.x * 1.1 + v_world.z * .54 + u_time * .78)), 24.0);
        float sunGlint = pow(halfLight, 34.0) * .72 + lineGlint * .12;
        vec3 nearWater = vec3(.055, .30, .39);
        vec3 farWater = vec3(.13, .43, .54);
        col = mix(nearWater, farWater, .28 + deep * .48);
        col += vec3(.025, .055, .06) * ripples;
        col += vec3(.58, .68, .62) * sunGlint;
        col *= .82 + diffuse * .24;
      } else {
        float detail = noise(v_world.xz * .42) * .10 + noise(v_world.xz * 1.35) * .035;
        float slope = 1.0 - normal.y;
        col = v_color;
        col *= .55 + diffuse * .62;
        col += detail;
        col = mix(col, col * vec3(.72, .78, .69), smoothstep(.16, .55, slope) * .38);
        float warmTop = smoothstep(1.4, 4.8, v_world.y) * diffuse;
        col += vec3(.10, .085, .04) * warmTop;
      }

      float fog = smoothstep(31.0, 76.0, v_depth);
      vec3 fogColor = vec3(.64, .76, .76);
      col = mix(col, fogColor, fog * .84);
      gl_FragColor = vec4(col, u_alpha);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  const locations = {
    position: gl.getAttribLocation(program, 'a_position'),
    color: gl.getAttribLocation(program, 'a_color'),
    normal: gl.getAttribLocation(program, 'a_normal'),
    projection: gl.getUniformLocation(program, 'u_projection'),
    view: gl.getUniformLocation(program, 'u_view'),
    time: gl.getUniformLocation(program, 'u_time'),
    wave: gl.getUniformLocation(program, 'u_wave'),
    alpha: gl.getUniformLocation(program, 'u_alpha')
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const coastAt = z => 3.8 + Math.sin(z * .075) * 1.55 + Math.sin(z * .21) * .34;

  function terrainHeight(x, z) {
    const coast = coastAt(z);
    if (x > coast) return -1.05 - (x - coast) * .028;
    const lowRoll = Math.sin(x * .16 + z * .035) * .48 + Math.cos(z * .085 - x * .025) * .38;
    const midRoll = Math.sin((x + z * .13) * .34) * .22 + Math.cos(z * .22 + x * .08) * .16;
    const mainRidge = Math.exp(-Math.pow((x + 12.0) / 9.0, 2)) * (2.05 + Math.sin(z * .115) * .58);
    const rearRidge = Math.exp(-Math.pow((x + 1.8) / 13.0, 2)) * (.58 + Math.sin(z * .067 + 1.4) * .24);
    const coastDrop = -Math.exp(-Math.pow((x - coast + .4) / 1.7, 2)) * .34;
    const micro = Math.sin(x * .78 + z * .41) * .055 + Math.sin(z * .91 - x * .27) * .035;
    return .72 + lowRoll + midRoll + mainRidge + rearRidge + coastDrop + micro;
  }

  function terrainColor(x, y, z) {
    const coast = coastAt(z);
    const shoreDistance = Math.abs(x - coast);
    if (x > coast) return [.055, .27, .28];
    const beach = clamp(1 - shoreDistance / 1.65, 0, 1);
    const elevation = clamp((y + .2) / 5.2, 0, 1);
    const dry = clamp((Math.sin(x * .37 + z * .12) + 1) * .5, 0, 1);
    const base = [
      .12 + elevation * .15 + dry * .035,
      .25 + elevation * .19 + dry * .04,
      .115 + elevation * .075
    ];
    const sand = [.51, .50, .34];
    return base.map((v, i) => v * (1 - beach) + sand[i] * beach);
  }

  function makeGrid({ x0, x1, z0, z1, nx, nz, height, color, flatNormal = false }) {
    const positions = [];
    const colors = [];
    const normals = [];
    const indices = [];
    const dx = (x1 - x0) / nx;
    const dz = (z1 - z0) / nz;
    for (let iz = 0; iz <= nz; iz++) {
      const z = z0 + dz * iz;
      for (let ix = 0; ix <= nx; ix++) {
        const x = x0 + dx * ix;
        const y = height(x, z);
        positions.push(x, y, z);
        colors.push(...color(x, y, z));
        if (flatNormal) {
          normals.push(0, 1, 0);
        } else {
          const hL = height(x - dx * .55, z);
          const hR = height(x + dx * .55, z);
          const hD = height(x, z - dz * .55);
          const hU = height(x, z + dz * .55);
          let nxv = hL - hR;
          let nyv = dx + dz;
          let nzv = hD - hU;
          const len = Math.hypot(nxv, nyv, nzv) || 1;
          normals.push(nxv / len, nyv / len, nzv / len);
        }
      }
    }
    for (let iz = 0; iz < nz; iz++) {
      for (let ix = 0; ix < nx; ix++) {
        const a = iz * (nx + 1) + ix;
        const b = a + 1;
        const c = a + nx + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      normals: new Float32Array(normals),
      indices: new Uint16Array(indices)
    };
  }

  function upload(mesh) {
    const pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pos);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
    const col = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, col);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.colors, gl.STATIC_DRAW);
    const normal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normal);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);
    const idx = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
    return { pos, col, normal, idx, count: mesh.indices.length };
  }

  const terrain = upload(makeGrid({
    x0: -31, x1: 30, z0: -66, z1: 16, nx: 124, nz: 132,
    height: terrainHeight,
    color: terrainColor
  }));
  const ocean = upload(makeGrid({
    x0: 2.0, x1: 43, z0: -68, z1: 19, nx: 82, nz: 126,
    height: () => -.31,
    color: () => [.06, .32, .42],
    flatNormal: true
  }));

  function perspective(out, fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    out.fill(0);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) / (near - far);
    out[11] = -1;
    out[14] = (2 * far * near) / (near - far);
    return out;
  }
  function normalize(v) {
    const len = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0]/len, v[1]/len, v[2]/len];
  }
  function cross(a,b) { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function lookAt(out, eye, center, up) {
    const z = normalize([eye[0]-center[0], eye[1]-center[1], eye[2]-center[2]]);
    const x = normalize(cross(up, z));
    const y = cross(z, x);
    out[0]=x[0]; out[1]=y[0]; out[2]=z[0]; out[3]=0;
    out[4]=x[1]; out[5]=y[1]; out[6]=z[1]; out[7]=0;
    out[8]=x[2]; out[9]=y[2]; out[10]=z[2]; out[11]=0;
    out[12]=-(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]);
    out[13]=-(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]);
    out[14]=-(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]);
    out[15]=1;
    return out;
  }

  const projection = new Float32Array(16);
  const view = new Float32Array(16);
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (event) => {
    pointer.tx = (event.clientX / innerWidth - .5) * 2;
    pointer.ty = (event.clientY / innerHeight - .5) * 2;
  }, { passive: true });
  window.addEventListener('deviceorientation', (event) => {
    if (typeof event.gamma === 'number') pointer.tx = clamp(event.gamma / 40, -1, 1);
    if (typeof event.beta === 'number') pointer.ty = clamp((event.beta - 45) / 50, -1, 1);
  }, { passive: true });

  function bind(mesh) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.pos);
    gl.enableVertexAttribArray(locations.position);
    gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.col);
    gl.enableVertexAttribArray(locations.color);
    gl.vertexAttribPointer(locations.color, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normal);
    gl.enableVertexAttribArray(locations.normal);
    gl.vertexAttribPointer(locations.normal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.idx);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0,0,width,height);
    }
    perspective(projection, Math.PI / 3.35, width / height, .1, 135);
  }

  let announcedReady = false;
  function render(ms) {
    const time = ms * .001;
    resize();
    pointer.x += (pointer.tx - pointer.x) * .018;
    pointer.y += (pointer.ty - pointer.y) * .018;
    const eye = [3.4 + pointer.x * 1.15 + Math.sin(time*.065)*.22, 4.15 - pointer.y * .34, 12.9 + Math.cos(time*.052)*.18];
    const center = [-1.4 + pointer.x * .45, .82 - pointer.y * .17, -24.5];
    lookAt(view, eye, center, [0,1,0]);

    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.uniformMatrix4fv(locations.projection, false, projection);
    gl.uniformMatrix4fv(locations.view, false, view);
    gl.uniform1f(locations.time, time);

    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.uniform1f(locations.wave, 0);
    gl.uniform1f(locations.alpha, 1);
    bind(terrain);
    gl.drawElements(gl.TRIANGLES, terrain.count, gl.UNSIGNED_SHORT, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.uniform1f(locations.wave, 1);
    gl.uniform1f(locations.alpha, .94);
    bind(ocean);
    gl.drawElements(gl.TRIANGLES, ocean.count, gl.UNSIGNED_SHORT, 0);
    gl.depthMask(true);

    if (!announcedReady) {
      document.documentElement.classList.add('webgl-ready');
      announcedReady = true;
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
