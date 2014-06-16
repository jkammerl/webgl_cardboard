
if (!Detector.webgl) Detector.addGetWebGLMessage();

var container, stats;
var camera, scene, renderer, light1, mesh, material;

var mouseX = 0,
    mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var obj_pos = new THREE.Vector3(0, 0, 3);
var camera_pos = new THREE.Vector3(0, 0, 0);
var camera_fov = 35

var light_dist = 2.5;

var light_plane_height, light_plane_width;

var material_specular = new THREE.Color(0.21, 0.21, 0.21);

init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    light_plane_height = Math.sin((camera_fov / 2.0) * Math.PI / 180) * light_dist * 2.0;
	var aspect_ratio = window.innerWidth / window.innerHeight;
	light_plane_width = light_plane_height * aspect_ratio;

    camera = new THREE.PerspectiveCamera(camera_fov, window.innerWidth / window.innerHeight, 0.1, 15);
    camera.position = camera_pos;

    scene = new THREE.Scene();

    var loader = new THREE.PLYLoader();
    loader.addEventListener('load', function (event) {

        var geometry = event.content;

        geometry.computeFaceNormals();
        //geometry.computeVertexNormals();

        material = new THREE.MeshPhongMaterial({
            ambient: 0xAAAAAA,
            color: 0xFFFFFF,
            shininess: 50,
            shading: THREE.SmoothShading,
            metal: false
        });
        material.specular = material_specular;
        mesh = new THREE.Mesh(geometry, material);

        mesh.position = obj_pos;
        mesh.rotation.set(0, Math.PI, +Math.PI / 2);
        mesh.scale.set(0.01, 0.01, 0.01);

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material.vertexColors = THREE.FaceColors;

        scene.add(mesh);

    });
    loader.load('models/me_small2.ply');

    light1 = new THREE.PointLight(0xffffff, 0.498, 2.145);
    light1.position.x = (0.5 / window.innerWidth) * light_plane_width * -1;
    light1.position.y = (0.5 / window.innerHeight) * light_plane_height * -1;
    light1.position.z = light_dist;
    scene.add(light1);

    // renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMapEnabled = true;
    renderer.shadowMapCullFace = THREE.CullFaceBack;

    container.appendChild(renderer.domElement);

    // EVENTS
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    // Setup canvas and expose context via ctx variable
    container.addEventListener('touchmove', function(event) {
        event.preventDefault();
        mouseX = event.touches[0].clientX - windowHalfX;
        mouseY = event.touches[0].clientY - windowHalfY;
    }, false);
}


function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

function animate() {

    requestAnimationFrame(animate);

    render();
    stats.update();
}

function render() {
    light1.position.x = (mouseX / window.innerWidth) * light_plane_width * -1;
    light1.position.y = (mouseY / window.innerHeight) * light_plane_height * -1;
    light1.position.z = light_dist;

    var targetX = mouseX * .0005 + Math.PI;
    var targetY = mouseY * -.0005;

    if (mesh) {
        mesh.rotation.y += 0.05 * (targetX - mesh.rotation.y);
        mesh.rotation.x += 0.05 * (targetY - mesh.rotation.x);

    }

    camera.lookAt(obj_pos);

    renderer.render(scene, camera);
}

