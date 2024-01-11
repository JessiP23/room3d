
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import "./App.css";

function App() {
  const canvasRef = useRef();

  const scene = useMemo(() => new THREE.Scene(), []);
  const camera = useMemo(
    () => new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000),
    []
  );
  camera.position.set(100, 0, 0);

  const renderer = useMemo(() => new THREE.WebGLRenderer({ antialias: true }), []);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xff00ff);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 0);
  scene.add(directionalLight);

   //walls
   const textureLoader = new THREE.TextureLoader();
   const floorTexture = textureLoader.load('./images/floor_texture.jpg');
   
   floorTexture.wrapS = THREE.RepeatWrapping;
   floorTexture.wrapT = THREE.RepeatWrapping;
   floorTexture.repeat.set(3,8);  

 
   
   const wallTexture = textureLoader.load('./images/wall_texture.jpg');
   const roomGeometry = new THREE.BoxGeometry(400,400,900);
   const roomSettings = [
     new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide, color: 0x404040}),
     new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide, color: 0x404040}),
     new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide}),
     new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.BackSide}),
     new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide, color: 0x404040}),
     new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide, color: 0x404040})
   ];

   const room = new THREE.Mesh(roomGeometry, roomSettings);
   
   scene.add(room);

   const paintingLoader = new THREE.TextureLoader();
   const paintingTexture1 = paintingLoader.load('./images/painting1.jpg');
   const paintingTexture2 = paintingLoader.load('./images/painting2.jpg');
   const paintingTexture3 = paintingLoader.load('./images/painting3.jpg');

   const paintingGeometry1 = new THREE.PlaneGeometry(90, 90);
   const paintingMaterial1 = new THREE.MeshBasicMaterial({map: paintingTexture1, side: THREE.DoubleSide});
   const painting1 = new THREE.Mesh(paintingGeometry1, paintingMaterial1);

   const paintingGeometry2 = new THREE.PlaneGeometry(90, 90);
   const paintingMaterial2 = new THREE.MeshBasicMaterial({map: paintingTexture2, side: THREE.DoubleSide});
   const painting2 = new THREE.Mesh(paintingGeometry2, paintingMaterial2);

   const paintingGeometry3 = new THREE.PlaneGeometry(90, 90);
   const paintingMaterial3 = new THREE.MeshBasicMaterial({map: paintingTexture3, side: THREE.DoubleSide});
   const painting3 = new THREE.Mesh(paintingGeometry3, paintingMaterial3);

   painting1.position.set(0, 100, 439);
   painting2.position.set(-190, 100, 100);
   painting3.position.set(-190, 100, -100);
   painting1.rotation.y = Math.PI;
   painting2.rotation.y = Math.PI / 2;
   painting3.rotation.y = Math.PI / 2;

   scene.add(painting1);
   scene.add(painting2);
   scene.add(painting3);

   //window
   function windowPaintings(scene, width, height, depth, positions){
     const windowShape = new THREE.Shape();
     windowShape.moveTo(-width / 2, -height / 2);
     windowShape.lineTo(width / 2, -height /2 );
     windowShape.lineTo(width / 2, height /2);
     windowShape.lineTo(-width / 2, height / 2);
     windowShape.lineTo(-width / 2, -height / 2);

     const holeWindow = new THREE.ExtrudeGeometry(windowShape, {
       depth: depth,
       bevelEnabled: false,
     });
     const holeMaterial = new THREE.MeshBasicMaterial({color: 'brown'});

     const windowMesh = new THREE.Mesh(holeWindow, holeMaterial);

     positions.forEach((position) => {
       const clonedWindow = windowMesh.clone();
       clonedWindow.position.set(position.x, position.y, position.z);
       clonedWindow.rotation.set(0, position.rotation, 0);
       scene.add(clonedWindow);
     });
   }

   const windowWidth = 100;
   const windowHeight = 100;
   const windowDepth = 30;

   const windowPositions = [
     {x: 0, y: 100, z: 440, rotation: 0},
     {x: -191, y: 100, z: 100, rotation: -Math.PI / 2},
     {x: -191, y: 100, z: -100, rotation: -Math.PI / 2},
   ];

   windowPaintings(scene, windowWidth, windowHeight, windowDepth, windowPositions);

  useEffect(() => {
    canvasRef.current.appendChild(renderer.domElement);

    const handleMouseMove = (event) => {
      const { clientX, clientY } = event;
      const boundingRect = canvasRef.current.getBoundingClientRect();

      const mouseX = (clientX - boundingRect.left) / boundingRect.width * 2 - 1;
      const mouseY = -(clientY - boundingRect.top) / boundingRect.height * 2 + 1;

      // Update camera position based on mouse movement
      const target = new THREE.Vector3(mouseX * 100, mouseY * 100, 0);
      camera.position.lerp(target, 0.001);

      const lookAtTarget = new THREE.Vector3(mouseX * 100, mouseY * 100, 10);
      camera.lookAt(lookAtTarget);
    };

    const handleKeyDown = (event) => {
      event.preventDefault();
      const distanceMovement = 5;

      switch(event.key){
        case "ArrowUp":
          const frontVector = new THREE.Vector3(0,0,-1);
          frontVector.applyQuaternion(camera.quaternion);
          camera.position.add(frontVector.multiplyScalar(distanceMovement));
          break;
        case "ArrowDown":
          const backVector = new THREE.Vector3(0,0,1);
          backVector.applyQuaternion(camera.quaternion);
          camera.position.add(backVector.multiplyScalar(distanceMovement));
          break;
        case "ArrowLeft":
          const leftVector = new THREE.Vector3(-1,0,0);
          leftVector.applyQuaternion(camera.quaternion);
          camera.position.add(leftVector.multiplyScalar(distanceMovement));
          break;
        case "ArrowRight":
          const rightVector = new THREE.Vector3(-1,0,0);
          rightVector.applyQuaternion(camera.quaternion);
          camera.position.add(rightVector.multiplyScalar(distanceMovement));
          break;
        default:
          break;
      }
    };

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    renderer.domElement.style.display = "block";

    window.addEventListener("resize", resize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.setAnimationLoop(null);
    };
  }, [renderer, scene, camera]);

  return <div className="myCanvas" ref={canvasRef}></div>;
}

export default App;