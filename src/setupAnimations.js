import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as THREE from "three";

const gltfLoader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
gltfLoader.setDRACOLoader(draco);

const AllActions = [];
const publicDir = "../public/";

export async function setupAnimationModels(scene, gui) {
  let modelUrl = "iron man rigged.glb";
  //"Iron-man-with no rig" (https://skfb.ly/6VA6O) by Darth Iron is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

  const gltf = await gltfLoader.loadAsync(publicDir + modelUrl);
  const model = gltf.scene;
  model.traverse((n) => {
    if (n.isMesh) {
      n.castShadow = true;
      n.receiveShadow = true;
    }
  });

  const skeleton = new THREE.SkeletonHelper(model);
  skeleton.visible = false;
  model.add(skeleton);
  scene.add(model);
  gui.add(skeleton, "visible").name("Skeleton");

  const mixer = new THREE.AnimationMixer(model);

  loadAnimations(mixer, gui);
  return mixer;
}

async function loadAnimations(mixer, gui) {
  const animGlbs = [
    "Guitar Playing.glb",
    "Hip Hop Dancing.glb",
    "Salute.glb",
    "Spin In Place.glb",
    "Strut Walking.glb",
    "Surprised.glb",
    "Backflip.glb",
    "Flying.glb",
    "Neutral Idle.glb",
    "Robot Hip Hop Dance.glb",
    "Two Cycle Sprint.glb"
  ];

  const commonActions = {
    stopAll: () => {
      AllActions.forEach((ac) => {
        ac.stop();
      });
    }
  };

  const fol = gui.addFolder("Anims");
  fol.add(commonActions, "stopAll");
  for (const url of animGlbs) {
    const animGltf = await gltfLoader.loadAsync(publicDir + "anims/" + url);
    const clip = animGltf.animations[0];
    const action = new THREE.AnimationAction(mixer, clip);
    AllActions.push(action);
    const aFol = fol.addFolder(clip.name);
    aFol.add(action, "play").onChange(() => {
      action.reset();
      action.fadeIn(0.5);
      AllActions.forEach((ac) => {
        if (ac !== action) {
          ac.fadeOut(0.5);
        }
      });
    });

    aFol.add(action, "time", 0, clip.duration).listen().disable();
  }
}
