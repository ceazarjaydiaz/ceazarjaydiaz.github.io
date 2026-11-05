(() => {
    'use strict';
    const canvas = document.querySelector('#city-canvas');
    const world = document.querySelector('[data-city-world]');
    const control = document.querySelector('[data-motion-control]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true, powerPreference: 'low-power' });
    if (!gl) {
        control.hidden = true;
        world.classList.add('fallback');
        return;
    }
    const vertexSource = `attribute vec3 position; attribute vec3 color;
        uniform mat4 matrix; uniform mediump float time; varying vec3 vColor; varying float depth;
        void main(){ vec3 p=position; vColor=color;
        if(color.r>3.){float a=time*.35;vec2 q=p.xz-vec2(.4,-1.5);p.xz=vec2(q.x*cos(a)-q.y*sin(a),q.x*sin(a)+q.y*cos(a))+vec2(.4,-1.5);vColor=vec3(.7,.85,1.);}
        else if(color.b>3.){p.x=mod(p.x+time*1.1+8.,16.)-8.;vColor=vec3(.55,.8,1.);}
        gl_Position=matrix*vec4(p,1.); depth=gl_Position.w; }`;
    const fragmentSource = `precision mediump float; varying vec3 vColor; varying float depth;
        uniform mediump float time; uniform float day;
        void main(){ float light=1.15+.06*sin(time*.7); vec3 c=vColor*light;
        float fog=smoothstep(30.,64.,depth)*.42;
        c=mix(c,c*1.15+vec3(.12,.14,.16),day); gl_FragColor=vec4(mix(c,mix(vec3(.025,.033,.047),vec3(.77,.83,.89),day),fog),1.); }`;
    function shader(type, source) {
        const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('City shader unavailable');
        return s;
    }
    let program;
    try {
        program = gl.createProgram();
        gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
        gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('City unavailable');
    } catch {
        world.classList.add('fallback'); control.hidden = true; return;
    }
    const vertices = [];
    function tri(a, b, c, color) { [a,b,c].forEach(p => vertices.push(...p,...color)); }
    function quad(a,b,c,d,color) { tri(a,b,c,color); tri(a,c,d,color); }
    function box(x,y,z,w,h,d,color) {
        const x0=x-w/2,x1=x+w/2,y0=y,y1=y+h,z0=z-d/2,z1=z+d/2;
        const shade = n => color.map(c => c*n);
        quad([x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],shade(1.45));
        quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],shade(.82));
        quad([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],shade(.55));
        quad([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],shade(1.1));
        quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],shade(.65));
    }
    const ice=[.55,.82,1.0], dim=[.19,.43,.58], metal=[.13,.20,.28];
    box(0,-.62,0,18,.55,14,[.065,.08,.105]);
    box(0,-.1,0,17.7,.1,13.7,[.085,.10,.125]);
    box(0,-.48,7.01,17.9,.025,.025,dim);
    box(9,-.48,0,.025,.025,14,ice);
    for(let x=-8;x<=8;x+=1) box(x,.006,0,.012,.008,13,[.12,.15,.19]);
    for(let z=-6;z<=6;z+=1) box(0,.006,z,17,.008,.012,[.12,.15,.19]);
    [-3,2.5].forEach(z => {
        box(0,.025,z,17,.013,.18,[.025,.035,.045]);
        box(0,.045,z,17,.009,.022,dim);
    });
    [-4,3].forEach(x => {
        box(x,.025,0,.22,.013,13,[.025,.035,.045]);
        box(x,.045,0,.023,.01,13,dim);
    });
    for(let i=0;i<8;i++) box(-7+i*2.1,.075,i%2?2.5:-3,.14,.025,.05,[.4,.7,10]);
    let seed=41;
    function random(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
    function tower(x,z,w,h,d,signature=false){
        box(x,0,z,w+.24,.13,d+.24,[.15,.18,.21]);
        box(x,.13,z,w,h,d,metal);
        box(x,h+.13,z,w+.06,.075,d+.06,[.27,.31,.36]);
        for(let y=.48;y<h;y+=.43){
            box(x,y,z+d/2+.007,w*.88,.055,.012,random()>.45?[.46,.63,.72]:[.19,.29,.39]);
            box(x+w/2+.007,y,z,.012,.055,d*.88,random()>.5?ice:[.18,.28,.39]);
        }
        for(let a=-w*.35;a<=w*.4;a+=.3) box(x+a,.15,z+d/2+.02,.025,h,.024,[.16,.19,.23]);
        box(x+w/2+.025,.15,z+d/2,.024,h,.025,signature?ice:dim);
        if(signature){
            box(x,h+.22,z,w*.68,.45,d*.68,[.18,.23,.28]);
            box(x,h+.68,z,w*.7,.025,d*.7,ice);
            box(x,h+.7,z,.035,1.1,.035,[.42,.55,.65]);
        }
    }
    tower(.4,-1.5,1.65,7.2,1.5,true);
    tower(-1.9,-2,1.3,5,1.35);
    tower(2.3,-2,1.05,4.7,1.2);
    tower(.6,-4,1.3,4,1.25);
    tower(-2,-4.4,.95,3.1,1.1);
    tower(4.8,-4.2,1.2,3.6,1.3);
    tower(6.8,-2.5,.9,2.9,1.1);
    tower(-5.8,-4.3,1.2,2.3,1.2);
    tower(-6.4,-1.3,1.1,3.1,1.3);
    tower(-5.7,1,1.35,1.5,1.3);
    tower(5.6,.2,1.3,2.1,1.5);
    tower(7,2.1,.8,1.4,1);
    box(-1.7,0,4.3,4,.2,2.1,[.17,.20,.24]);
    box(-1.7,.2,4.3,3.6,.9,1.8,[.08,.11,.15]);
    box(-1.7,1.1,4.3,4,.1,2.1,[.3,.34,.39]);
    box(-1.7,.45,5.22,2.8,.45,.025,[.26,.45,.57]);
    for(let i=0;i<5;i++) box(-3+i*.65,.25,5.25,.025,.8,.04,[.36,.42,.47]);
    tower(-6,4.3,1.65,2.2,1.65,true);
    tower(4.8,4.1,1.5,2.6,1.5,true);
    box(.4,2.6,-2,4.5,.12,.35,[.24,.30,.36]);
    box(.4,2.74,-1.82,4.5,.025,.025,ice);
    for(let i=0;i<25;i++){
        const x=-7.8+random()*15.6,z=-5.8+random()*11.6;
        if(Math.abs(z-2.5)<.4 || Math.abs(x-3)<.4){
            box(x,.05,z,.045,.45,.045,[.22,.27,.3]);
            box(x,.5,z,.09,.05,.09,ice);
        }
    }
    [[-1.7,5.7],[-6,5.6],[4.8,5.6]].forEach(([x,z]) => {
        box(x,.035,z,.6,.02,.35,dim);
        box(x,.06,z,.25,.02,.12,ice);
    });
    const gold=[.7,.49,.28], violet=[.4,.38,.7];
    function ring(x,y,z,r,thickness,color){
        for(let i=0;i<80;i++){
            const a=i/80*Math.PI*2,b=(i+1)/80*Math.PI*2;
            quad([x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(b)*r,y,z+Math.sin(b)*r],[x+Math.cos(b)*(r-thickness),y,z+Math.sin(b)*(r-thickness)],[x+Math.cos(a)*(r-thickness),y,z+Math.sin(a)*(r-thickness)],color);
        }
    }
    ring(.4,5.9,-1.5,2.1,.055,ice);
    ring(.4,5.86,-1.5,2.18,.16,[.18,.25,.35]);
    ring(-1.7,.05,4.3,2.65,.045,ice);
    ring(4.8,.05,4.1,1.5,.045,gold);
    for(let i=0;i<4;i++)box(.4,7.4+i*.24,-1.5,1.5-i*.27,.18,1.4-i*.25,[.24+i*.05,.34+i*.04,.45+i*.04]);
    box(-6,1.3,5.14,1.35,.6,.035,gold);
    box(4.8,1.9,4.87,1.2,.38,.035,violet);
    for(let x=-7;x<8;x+=1.5){
        box(x,.06,-5.8,.45,.12,.45,[.12,.19,.23]);
        box(x,.18,-5.8,.34,.27,.34,[.13,.29,.25]);
    }
    for(let i=0;i<18;i++){
        const a=i/18*Math.PI*2;
        box(.4+Math.cos(a)*2.13,5.95,-1.5+Math.sin(a)*2.13,.045,.045,.045,[10,.7,1]);
    }
    gl.useProgram(program);
    const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    ['position','color'].forEach((name,i)=>{
        const location=gl.getAttribLocation(program,name);
        gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location,3,gl.FLOAT,false,24,i*12);
    });
    gl.enable(gl.DEPTH_TEST);
    const matrixLocation=gl.getUniformLocation(program,'matrix'), timeLocation=gl.getUniformLocation(program,'time'), dayLocation=gl.getUniformLocation(program,'day');
    function multiply(a,b){ const o=new Float32Array(16); for(let c=0;c<4;c++)for(let r=0;r<4;r++){o[c*4+r]=0;for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];}return o; }
    function normalize(v){const n=Math.hypot(...v);return v.map(x=>x/n);}
    function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
    function view(eye,target){
        const z=normalize(eye.map((v,i)=>v-target[i])),x=normalize(cross([0,1,0],z)),y=cross(z,x);
        const dot=a=>-a.reduce((s,v,i)=>s+v*eye[i],0);
        return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,dot(x),dot(y),dot(z),1]);
    }
    const landmarks=[['experience',[.4,8.2,-1.5]],['work',[-1.7,1.25,4.3]],['about',[-6,2.5,4.3]],['contact',[4.8,3,4.1]]].map(([id,p])=>({el:document.querySelector(`[data-landmark="${id}"]`),p}));
    let width=0,height=0,paused=reduced.matches,visible=true,frame=0,last=0,elapsed=0,pointer=0,angle=0,lost=false;
    let destination='top', travel=0, themeTravel=0, dayMix=document.documentElement.dataset.theme==='day'?1:0;
    const stops={top:[0,1.6,0,29,.68],work:[-1.7,1,4.3,19,.4],capabilities:[-6,2,4.3,20,1.1],experience:[.4,4,-1.5,22,.85],contact:[4.8,2,4.1,19,.2]};
    let camera=[...stops.top];
    window.addEventListener('city:navigate',e=>{destination=e.detail.destination;travel=reduced.matches?0:1;if(reduced.matches)camera=[...stops[destination]];schedule();});
    control.setAttribute('aria-pressed',String(paused));
    function label(){ document.documentElement.classList.toggle('motion-paused',paused); control.innerHTML=paused?'Resume Motion <span>▷</span>':'Pause Motion <span>Ⅱ</span>'; control.setAttribute('aria-pressed',String(paused)); }
    label();
    function render(now=0){
        frame=0;
        if(lost) return;
        const dt=Math.min((now-last)/1000,.05);last=now;
        const dayTarget=document.documentElement.dataset.theme==='day'?1:0; dayMix=reduced.matches?dayTarget:dayMix+(dayTarget-dayMix)*Math.min(1,dt*9);themeTravel=Math.max(0,themeTravel-dt);
        if(!paused) elapsed+=dt;
        const rect=canvas.getBoundingClientRect();
        const ratio=Math.min(devicePixelRatio||1,innerWidth<700?1.4:1.75);
        if(width!==rect.width || height!==rect.height){width=rect.width;height=rect.height;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);gl.viewport(0,0,canvas.width,canvas.height);}
        if(!width||!height)return;
        angle+=(pointer-angle)*.035;
        const orbit=paused?0:Math.sin(elapsed*.12)*.035+angle*.065;
        const stop=stops[destination]; camera=camera.map((v,i)=>v+(stop[i]-v)*Math.min(1,dt*5)); travel=Math.max(0,travel-dt); const a=camera[4]+orbit, distance=camera[3]*(innerWidth<700?1.24:1);
        const eye=[camera[0]+Math.sin(a)*distance,(innerWidth<700?24:19)*(distance/29),camera[2]+Math.cos(a)*distance];
        const f=1/Math.tan(.64/2),aspect=width/height;
        const projection=new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,-1.002,-1,0,0,-.2002,0]);
        const matrix=multiply(projection,view(eye,camera.slice(0,3)));
        gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(matrixLocation,false,matrix);gl.uniform1f(timeLocation,elapsed);gl.uniform1f(dayLocation,dayMix);
        gl.drawArrays(gl.TRIANGLES,0,vertices.length/6);
        landmarks.forEach(({el,p})=>{
            const q=[...p,1],v=[0,0,0,0];for(let r=0;r<4;r++)for(let k=0;k<4;k++)v[r]+=matrix[k*4+r]*q[k];
            el.style.left=`${(v[0]/v[3]*.5+.5)*100}%`;el.style.top=`${(-v[1]/v[3]*.5+.5)*100}%`;
        });
        world.classList.add('ready');
        if((!paused||travel>0||themeTravel>0)&&visible&&!document.hidden) frame=requestAnimationFrame(render);
    }
    function schedule(){ if(!frame&&visible&&!document.hidden&&!lost) {last=performance.now();frame=requestAnimationFrame(render);} }
    control.addEventListener('click',()=>{paused=!paused;label();schedule();});
    reduced.addEventListener('change',()=>{paused=reduced.matches;label();schedule();});
    world.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')pointer=(e.clientX/innerWidth-.5)*2;});
    world.addEventListener('pointerleave',()=>pointer=0);
    new ResizeObserver(schedule).observe(canvas);
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'100px'}).observe(world);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);world.classList.remove('ready');world.classList.add('fallback');control.hidden=true;});
    addEventListener('theme:change',()=>{themeTravel=.8;schedule();});
    schedule();
})();

