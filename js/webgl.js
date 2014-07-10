
if (!Detector.webgl) Detector.addGetWebGLMessage();
var noSleep;
var container, stats;
var camera, scene, renderer, light1, mesh, material, effect, clock, controls;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var obj_pos = new THREE.Vector3(0, 0, 12);
var camera_pos = new THREE.Vector3(0, 0, 0);
var camera_fov = 90

var light_dist = 3.5;
var light_radius = 1.0;

var light_plane_height_half, light_plane_width_half;

var material_specular = new THREE.Color(0.21, 0.21, 0.21);

init();
animate();

function init() {
    noSleep = new NoSleep();

    container = document.createElement('div');
    container.innerHTML = '<h3 style="color: white;">Loading mesh.. </h3>';
    document.body.appendChild(container);

    var light_plane_height = Math.sin((camera_fov / 2.0) * Math.PI / 180) * light_dist * 2.0;
    var aspect_ratio = window.innerWidth / window.innerHeight;
    var light_plane_width = light_plane_height * aspect_ratio;
    light_plane_height_half = light_plane_height / 2.0;
    light_plane_width_half = light_plane_width / 2.0;

    camera = new THREE.PerspectiveCamera(camera_fov, 1, 0.001, 700);
    camera.position = camera_pos;
    camera.lookAt(obj_pos);

    scene = new THREE.Scene();

    clock = new THREE.Clock(true);

    function setOrientationControls(e) {
        if (!e.alpha) {
          return;
        }
        if (controls == null) {
            controls = new THREE.DeviceOrientationControls(camera, true);
            controls.connect();
            controls.update();
        }
        window.removeEventListener('deviceorientation', setOrientationControls.bind(this));
    }
    window.addEventListener('deviceorientation', setOrientationControls, true);

    var loader = new THREE.PLYLoader();
    loader.addEventListener('load', function (event) {
	    container.innerHTML = '';
        
        var geometry = event.content;
        geometry.computeFaceNormals();

        material = new THREE.MeshPhongMaterial({
            ambient: 0xAAAAAA,
            color: 0xFFFFFF,
            shininess: 15,
            shading: THREE.SmoothShading,
            metal: false,
            side: THREE.DoubleSide
        });
        material.specular = material_specular;
        mesh = new THREE.Mesh(geometry, material);

        mesh.position = obj_pos;
        mesh.rotation.set(0, Math.PI, +Math.PI / 2);
        mesh.scale.set(0.1, 0.1, 0.1);

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material.vertexColors = THREE.FaceColors;

        scene.add(mesh);
      
        container.appendChild(renderer.domElement);

        noSleep.enable();
    });
    loader.load('models/me_small2.ply');

    light1 = new THREE.PointLight(0xffffff, 0.898, 15.145);
    scene.add(light1);

    // RENDERER
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMapEnabled = true;
    renderer.shadowMapCullFace = THREE.CullFaceBack;

    effect = new THREE.StereoEffect(renderer);

    // EVENTS
    window.addEventListener('resize', onWindowResize, false);
    container.addEventListener('click', fullscreen, false);
}


function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    effect.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    update();
    render();
}

function update() {
  onWindowResize();
  camera.updateProjectionMatrix();
  if (controls) {
      controls.update();
  }
}


function render() {
    light1.position.x = Math.sin(clock.elapsedTime * 1) * light_plane_width_half * light_radius;
    light1.position.y = Math.cos(clock.elapsedTime * 1) * light_plane_height_half * light_radius;
    light1.position.z = light_dist;

    var targetX = light1.position.x * .07 + Math.PI;
    var targetY = light1.position.y * -.07 ;

    if (mesh) {
        mesh.rotation.y += 0.05 * (targetX - mesh.rotation.y);
        mesh.rotation.x += 0.05 * (targetY - mesh.rotation.x);
    }

    effect.render(scene, camera);
}

function fullscreen() {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
}

