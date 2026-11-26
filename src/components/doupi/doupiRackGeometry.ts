import * as THREE from 'three';
import { formatXOF } from '../../lib/format';

export const RACK_RAIL_Y = 1.62;
export const GARMENT_SPACING = 1.62;
export const GARMENT_WIDTH = 1.08;
export const GARMENT_HEIGHT = 1.46;

export interface GarmentRig {
  index: number;
  productId: string;
  /** Positioned along X on the rack at y = RACK_RAIL_Y */
  rootGroup: THREE.Group;
  /** Child of rootGroup — handles pendulum sway & unhook lift/zoom */
  swingGroup: THREE.Group;
  /** Child of swingGroup — handles 3D inspection rotation (front/back flip) */
  cardGroup: THREE.Group;
  /** Hanging price tag pivot for subtle secondary sway */
  tagPivot: THREE.Group;
  /** Floor contact shadow mesh */
  shadowMesh: THREE.Mesh;
  /** Raycastable hit mesh */
  hitMesh: THREE.Mesh;
  /** Front & back materials for progressive texture assignment */
  frontMat: THREE.MeshStandardMaterial;
  backMat: THREE.MeshStandardMaterial;
  /** Base X position on the rack */
  baseX: number;
  /** Animated physics state */
  swayZ: number;
  swayVelZ: number;
  tagSwayZ: number;
  unhookProgress: number;
  flipAngle: number;
  inspectYaw: number;
  disposables: Array<{ dispose: () => void }>;
}

/**
 * Creates a subtly curved 3D garment showcase plane so fabric photography
 * catches directional studio lighting with organic depth rather than looking flat.
 */
function createCurvedGarmentFace(
  width: number,
  height: number,
  zOffset: number,
  flipUV: boolean
): THREE.BufferGeometry {
  const segX = 18;
  const segY = 14;
  const geom = new THREE.PlaneGeometry(width, height, segX, segY);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const nx = x / (width * 0.5); // -1 .. 1
    const ny = y / (height * 0.5); // -1 .. 1

    // Subtle organic convex drape across width + gentle hem wave at bottom
    const archZ = (1 - nx * nx) * 0.042;
    const hemWave = Math.sin(nx * Math.PI * 1.5) * 0.014 * Math.max(0, -ny);
    const shoulderCurve = Math.max(0, ny - 0.72) * 0.025;
    const sign = zOffset >= 0 ? 1 : -1;

    pos.setZ(i, zOffset + sign * (archZ + hemWave - shoulderCurve));
  }

  if (flipUV) {
    geom.rotateY(Math.PI);
  }
  geom.computeVertexNormals();
  return geom;
}

/**
 * Draws a crisp, high-DPI minimalist atelier price tag onto a CanvasTexture.
 */
function createPriceTagTexture(
  indexNumber: number,
  priceXof: number,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Warm matte archival cotton paper
    ctx.fillStyle = '#FAF9F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Crisp hairline border
    ctx.strokeStyle = 'rgba(18, 18, 18, 0.14)';
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

    // Top punch eyelet
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 74, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#E5E2DA';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#9E9A90';
    ctx.stroke();

    // Brand micro-header
    ctx.fillStyle = '#111111';
    ctx.font = '600 28px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KIKI JONES', canvas.width / 2, 168);

    ctx.fillStyle = 'rgba(17, 17, 17, 0.5)';
    ctx.font = '500 20px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('DOUPI  ·  PREMIUM', canvas.width / 2, 206);

    // Thin divider
    ctx.fillStyle = 'rgba(17, 17, 17, 0.16)';
    ctx.fillRect(88, 246, canvas.width - 176, 2);

    // Piece index
    ctx.fillStyle = 'rgba(17, 17, 17, 0.45)';
    ctx.font = '500 24px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(`N° ${String(indexNumber + 1).padStart(2, '0')}`, canvas.width / 2, 312);

    // Price
    const formatted = formatXOF(priceXof);
    ctx.fillStyle = '#0A0A0A';
    ctx.font = '700 44px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(formatted, canvas.width / 2, 410);

    // Thin divider
    ctx.fillStyle = 'rgba(17, 17, 17, 0.14)';
    ctx.fillRect(88, 476, canvas.width - 176, 2);

    // Minimalist barcode graphic
    const barWidths = [4, 2, 6, 3, 2, 5, 2, 4, 7, 2, 3, 5, 2, 4, 3, 6, 2, 3, 5, 2, 4, 3];
    let bx = 114;
    ctx.fillStyle = '#141414';
    for (let i = 0; i < barWidths.length; i++) {
      const w = barWidths[i] * 2;
      if (i % 2 === 0) {
        ctx.fillRect(bx, 526, w, 96);
      }
      bx += w + 4;
    }

    ctx.fillStyle = 'rgba(17, 17, 17, 0.48)';
    ctx.font = '400 18px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('ATELIER EDITION', canvas.width / 2, 662);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, maxAnisotropy);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates a soft elliptical studio contact shadow texture.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 64, 8, 128, 64, 120);
    grad.addColorStop(0, 'rgba(18, 17, 15, 0.24)');
    grad.addColorStop(0.55, 'rgba(18, 17, 15, 0.09)');
    grad.addColorStop(1, 'rgba(18, 17, 15, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates a neutral linen placeholder texture while product photography streams in.
 */
export function createPlaceholderFabricTexture(label: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 340);
    grad.addColorStop(0, '#EFECE6');
    grad.addColorStop(1, '#E5E1D9');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 340);

    ctx.fillStyle = 'rgba(20, 20, 20, 0.28)';
    ctx.font = '500 13px "Inter", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KIKI JONES DOUPI', 128, 165);
    ctx.font = '400 11px "Inter", Arial, sans-serif';
    ctx.fillText(label.slice(0, 24).toUpperCase(), 128, 188);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Shared procedural geometries & PBR materials for the boutique garment rack & hangers
 * so memory usage stays tiny across all 12–15 hanging garments.
 */
export interface SharedAtelierAssets {
  chromeMat: THREE.MeshStandardMaterial;
  matteBlackMetalMat: THREE.MeshStandardMaterial;
  hangerWoodMat: THREE.MeshStandardMaterial;
  cordMat: THREE.MeshStandardMaterial;
  garmentEdgeMat: THREE.MeshStandardMaterial;
  hookGeom: THREE.TubeGeometry;
  hangerArmLeftGeom: THREE.CylinderGeometry;
  hangerArmRightGeom: THREE.CylinderGeometry;
  hangerNeckGeom: THREE.CylinderGeometry;
  frontFaceGeom: THREE.BufferGeometry;
  backFaceGeom: THREE.BufferGeometry;
  edgeFrameGeom: THREE.BoxGeometry;
  tagGeom: THREE.BoxGeometry;
  cordGeom: THREE.CylinderGeometry;
  eyeletGeom: THREE.TorusGeometry;
  hitBoxGeom: THREE.BoxGeometry;
  shadowGeom: THREE.PlaneGeometry;
  shadowMatTemplate: THREE.MeshBasicMaterial;
  shadowTex: THREE.CanvasTexture;
  dispose: () => void;
}

export function createSharedAtelierAssets(): SharedAtelierAssets {
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe6e7ea,
    metalness: 0.94,
    roughness: 0.16,
  });

  const matteBlackMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e1e1e,
    metalness: 0.72,
    roughness: 0.34,
  });

  const hangerWoodMat = new THREE.MeshStandardMaterial({
    color: 0x1a1918,
    metalness: 0.08,
    roughness: 0.42,
  });

  const cordMat = new THREE.MeshStandardMaterial({
    color: 0x181818,
    roughness: 0.9,
    metalness: 0.0,
  });

  const garmentEdgeMat = new THREE.MeshStandardMaterial({
    color: 0xe8e6e1,
    roughness: 0.82,
    metalness: 0.02,
  });

  // Realistic curved chrome hook wrapping over the rail (rail centered at y = 0 in pivot space)
  const hookCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.17, 0),
    new THREE.Vector3(0, -0.075, 0),
    new THREE.Vector3(0.0, -0.02, 0.042),
    new THREE.Vector3(0.0, 0.044, 0.032),
    new THREE.Vector3(0.0, 0.052, -0.028),
    new THREE.Vector3(0.0, 0.008, -0.044),
  ]);
  const hookGeom = new THREE.TubeGeometry(hookCurve, 22, 0.0085, 10, false);

  const hangerArmLeftGeom = new THREE.CylinderGeometry(0.015, 0.022, 0.48, 12);
  const hangerArmRightGeom = new THREE.CylinderGeometry(0.015, 0.022, 0.48, 12);
  const hangerNeckGeom = new THREE.CylinderGeometry(0.022, 0.026, 0.09, 12);

  const frontFaceGeom = createCurvedGarmentFace(GARMENT_WIDTH, GARMENT_HEIGHT, 0.011, false);
  const backFaceGeom = createCurvedGarmentFace(GARMENT_WIDTH, GARMENT_HEIGHT, -0.011, true);
  const edgeFrameGeom = new THREE.BoxGeometry(GARMENT_WIDTH + 0.014, GARMENT_HEIGHT + 0.014, 0.018);

  const tagGeom = new THREE.BoxGeometry(0.22, 0.31, 0.005);
  const cordGeom = new THREE.CylinderGeometry(0.0024, 0.0024, 0.22, 6);
  const eyeletGeom = new THREE.TorusGeometry(0.012, 0.003, 8, 16);

  const hitBoxGeom = new THREE.BoxGeometry(GARMENT_WIDTH + 0.16, GARMENT_HEIGHT + 0.48, 0.28);
  const shadowGeom = new THREE.PlaneGeometry(1.36, 0.52);
  const shadowTex = createContactShadowTexture();
  const shadowMatTemplate = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });

  return {
    chromeMat,
    matteBlackMetalMat,
    hangerWoodMat,
    cordMat,
    garmentEdgeMat,
    hookGeom,
    hangerArmLeftGeom,
    hangerArmRightGeom,
    hangerNeckGeom,
    frontFaceGeom,
    backFaceGeom,
    edgeFrameGeom,
    tagGeom,
    cordGeom,
    eyeletGeom,
    hitBoxGeom,
    shadowGeom,
    shadowMatTemplate,
    shadowTex,
    dispose() {
      chromeMat.dispose();
      matteBlackMetalMat.dispose();
      hangerWoodMat.dispose();
      cordMat.dispose();
      garmentEdgeMat.dispose();
      hookGeom.dispose();
      hangerArmLeftGeom.dispose();
      hangerArmRightGeom.dispose();
      hangerNeckGeom.dispose();
      frontFaceGeom.dispose();
      backFaceGeom.dispose();
      edgeFrameGeom.dispose();
      tagGeom.dispose();
      cordGeom.dispose();
      eyeletGeom.dispose();
      hitBoxGeom.dispose();
      shadowGeom.dispose();
      shadowMatTemplate.dispose();
      shadowTex.dispose();
    },
  };
}

/**
 * Builds the architectural brushed-chrome garment rack (portant) spanning the entire collection.
 */
export function createAtelierRack(
  itemCount: number,
  assets: SharedAtelierAssets,
  castShadows: boolean
): { group: THREE.Group; disposables: Array<{ dispose: () => void }> } {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const totalSpan = Math.max(8, (itemCount - 1) * GARMENT_SPACING + 4.4);
  const centerX = ((itemCount - 1) * GARMENT_SPACING) / 2;
  const floorY = -0.68;

  // Main horizontal brushed chrome rail
  const railGeom = new THREE.CylinderGeometry(0.025, 0.025, totalSpan, 24);
  railGeom.rotateZ(Math.PI / 2);
  disposables.push(railGeom);
  const railMesh = new THREE.Mesh(railGeom, assets.chromeMat);
  railMesh.position.set(centerX, RACK_RAIL_Y, 0);
  railMesh.castShadow = castShadows;
  group.add(railMesh);

  // Decorative end-stop rings & caps
  const capGeom = new THREE.SphereGeometry(0.032, 16, 16);
  const collarGeom = new THREE.CylinderGeometry(0.034, 0.034, 0.04, 16);
  collarGeom.rotateZ(Math.PI / 2);
  disposables.push(capGeom, collarGeom);

  const leftEdge = centerX - totalSpan / 2;
  const rightEdge = centerX + totalSpan / 2;

  for (const edgeX of [leftEdge, rightEdge]) {
    const cap = new THREE.Mesh(capGeom, assets.chromeMat);
    cap.position.set(edgeX, RACK_RAIL_Y, 0);
    group.add(cap);

    const collar = new THREE.Mesh(collarGeom, assets.matteBlackMetalMat);
    collar.position.set(edgeX + (edgeX === leftEdge ? 0.24 : -0.24), RACK_RAIL_Y, 0);
    group.add(collar);
  }

  // Architectural vertical stanchions + sled feet at rack ends (and intermediate support for long racks)
  const postHeight = RACK_RAIL_Y - floorY;
  const postGeom = new THREE.CylinderGeometry(0.022, 0.026, postHeight, 16);
  const footBarGeom = new THREE.BoxGeometry(0.055, 0.028, 0.92);
  const jointGeom = new THREE.CylinderGeometry(0.036, 0.036, 0.07, 16);
  disposables.push(postGeom, footBarGeom, jointGeom);

  const postPositions = [leftEdge + 0.32, rightEdge - 0.32];
  for (const px of postPositions) {
    const post = new THREE.Mesh(postGeom, assets.matteBlackMetalMat);
    post.position.set(px, floorY + postHeight / 2, 0);
    post.castShadow = castShadows;
    group.add(post);

    const joint = new THREE.Mesh(jointGeom, assets.chromeMat);
    joint.position.set(px, RACK_RAIL_Y, 0);
    group.add(joint);

    const foot = new THREE.Mesh(footBarGeom, assets.matteBlackMetalMat);
    foot.position.set(px, floorY + 0.014, 0);
    foot.receiveShadow = castShadows;
    group.add(foot);
  }

  // Lower architectural tie-bar
  const tieLength = postPositions[1] - postPositions[0];
  const tieGeom = new THREE.CylinderGeometry(0.012, 0.012, tieLength, 12);
  tieGeom.rotateZ(Math.PI / 2);
  disposables.push(tieGeom);
  const tieMesh = new THREE.Mesh(tieGeom, assets.matteBlackMetalMat);
  tieMesh.position.set(centerX, floorY + 0.09, 0);
  group.add(tieMesh);

  return { group, disposables };
}

/**
 * Creates a complete hanging garment unit (hook + wooden hanger + curved double-sided garment + price tag + floor shadow).
 */
export function createGarmentRig(params: {
  index: number;
  productId: string;
  productName: string;
  priceXof: number;
  frontImageUrl: string;
  backImageUrl: string;
  assets: SharedAtelierAssets;
  textureLoader: THREE.TextureLoader;
  maxAnisotropy: number;
  castShadows: boolean;
}): GarmentRig {
  const {
    index,
    productId,
    productName,
    priceXof,
    frontImageUrl,
    backImageUrl,
    assets,
    textureLoader,
    maxAnisotropy,
    castShadows,
  } = params;

  const disposables: Array<{ dispose: () => void }> = [];
  const baseX = index * GARMENT_SPACING;

  const rootGroup = new THREE.Group();
  rootGroup.position.set(baseX, RACK_RAIL_Y, 0);

  const swingGroup = new THREE.Group();
  rootGroup.add(swingGroup);

  const cardGroup = new THREE.Group();
  swingGroup.add(cardGroup);

  // 1. Chrome swivel hook wrapping the rail
  const hookMesh = new THREE.Mesh(assets.hookGeom, assets.chromeMat);
  hookMesh.castShadow = castShadows;
  cardGroup.add(hookMesh);

  // 2. Sculpted matte-ebony atelier hanger
  const hangerNeck = new THREE.Mesh(assets.hangerNeckGeom, assets.hangerWoodMat);
  hangerNeck.position.set(0, -0.2, 0);
  cardGroup.add(hangerNeck);

  const leftArm = new THREE.Mesh(assets.hangerArmLeftGeom, assets.hangerWoodMat);
  leftArm.position.set(-0.21, -0.295, 0);
  leftArm.rotation.z = -1.16;
  leftArm.castShadow = castShadows;
  cardGroup.add(leftArm);

  const rightArm = new THREE.Mesh(assets.hangerArmRightGeom, assets.hangerWoodMat);
  rightArm.position.set(0.21, -0.295, 0);
  rightArm.rotation.z = 1.16;
  rightArm.castShadow = castShadows;
  cardGroup.add(rightArm);

  // 3. Sculpted 3D Garment Panel (Front & Back PBR Materials)
  const placeholderTex = createPlaceholderFabricTexture(productName);
  disposables.push(placeholderTex);

  const frontMat = new THREE.MeshStandardMaterial({
    map: placeholderTex,
    roughness: 0.72,
    metalness: 0.02,
    envMapIntensity: 0.45,
  });

  const backMat = new THREE.MeshStandardMaterial({
    map: placeholderTex,
    roughness: 0.74,
    metalness: 0.02,
    envMapIntensity: 0.4,
  });
  disposables.push(frontMat, backMat);

  const garmentCenterY = -0.34 - GARMENT_HEIGHT / 2;

  const frontMesh = new THREE.Mesh(assets.frontFaceGeom, frontMat);
  frontMesh.position.set(0, garmentCenterY, 0);
  frontMesh.castShadow = castShadows;
  frontMesh.receiveShadow = castShadows;
  cardGroup.add(frontMesh);

  const backMesh = new THREE.Mesh(assets.backFaceGeom, backMat);
  backMesh.position.set(0, garmentCenterY, 0);
  backMesh.castShadow = castShadows;
  cardGroup.add(backMesh);

  const edgeMesh = new THREE.Mesh(assets.edgeFrameGeom, assets.garmentEdgeMat);
  edgeMesh.position.set(0, garmentCenterY, 0);
  cardGroup.add(edgeMesh);

  // 4. Hanging Paper Price Tag attached to right hanger shoulder
  const tagPivot = new THREE.Group();
  tagPivot.position.set(0.39, -0.34, 0.035);
  cardGroup.add(tagPivot);

  const cordMesh = new THREE.Mesh(assets.cordGeom, assets.cordMat);
  cordMesh.position.set(0, -0.11, 0);
  tagPivot.add(cordMesh);

  const tagTex = createPriceTagTexture(index, priceXof, maxAnisotropy);
  const tagSideMat = new THREE.MeshStandardMaterial({
    color: 0xf4f2ec,
    roughness: 0.9,
  });
  const tagFaceMat = new THREE.MeshStandardMaterial({
    map: tagTex,
    roughness: 0.84,
    metalness: 0.0,
  });
  disposables.push(tagTex, tagSideMat, tagFaceMat);

  const tagMesh = new THREE.Mesh(assets.tagGeom, [
    tagSideMat,
    tagSideMat,
    tagSideMat,
    tagSideMat,
    tagFaceMat,
    tagFaceMat,
  ]);
  tagMesh.position.set(0, -0.34, 0);
  tagMesh.rotation.y = -0.14;
  tagMesh.rotation.z = 0.06;
  tagMesh.castShadow = castShadows;
  tagPivot.add(tagMesh);

  const eyelet = new THREE.Mesh(assets.eyeletGeom, assets.chromeMat);
  eyelet.position.set(0, -0.22, 0.003);
  eyelet.rotation.y = -0.14;
  tagPivot.add(eyelet);

  // 5. Invisible Raycast Proxy on Layer 1
  const hitMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  disposables.push(hitMat);
  const hitMesh = new THREE.Mesh(assets.hitBoxGeom, hitMat);
  hitMesh.position.set(0, garmentCenterY + 0.1, 0);
  hitMesh.layers.set(1);
  hitMesh.userData = { garmentIndex: index, productId };
  cardGroup.add(hitMesh);

  // 6. Soft Contact Shadow on Studio Floor
  const shadowMat = assets.shadowMatTemplate.clone();
  disposables.push(shadowMat);
  const shadowMesh = new THREE.Mesh(assets.shadowGeom, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.set(baseX, -0.675, 0);

  // Progressive Image Texture Loading
  const applyTexture = (url: string, targetMat: THREE.MeshStandardMaterial) => {
    if (!url) return;
    textureLoader.load(
      url,
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        loadedTex.anisotropy = Math.min(8, maxAnisotropy);
        loadedTex.generateMipmaps = true;
        loadedTex.minFilter = THREE.LinearMipmapLinearFilter;

        // Center-crop image gracefully to match the portrait garment panel aspect ratio
        const img = loadedTex.image as HTMLImageElement | undefined;
        if (img && img.width && img.height) {
          const imgAspect = img.width / img.height;
          const panelAspect = GARMENT_WIDTH / GARMENT_HEIGHT;
          if (imgAspect > panelAspect) {
            const repeatX = panelAspect / imgAspect;
            loadedTex.repeat.set(repeatX, 1);
            loadedTex.offset.set((1 - repeatX) / 2, 0);
          } else {
            const repeatY = imgAspect / panelAspect;
            loadedTex.repeat.set(1, repeatY);
            // Bias slightly toward top so head/shoulders/neckline stay framed cleanly
            loadedTex.offset.set(0, (1 - repeatY) * 0.72);
          }
        }
        loadedTex.needsUpdate = true;
        targetMat.map = loadedTex;
        targetMat.needsUpdate = true;
        disposables.push(loadedTex);
      },
      undefined,
      () => {
        // Keep clean linen placeholder if an image fails to load
      }
    );
  };

  applyTexture(frontImageUrl, frontMat);
  applyTexture(backImageUrl || frontImageUrl, backMat);

  return {
    index,
    productId,
    rootGroup,
    swingGroup,
    cardGroup,
    tagPivot,
    shadowMesh,
    hitMesh,
    frontMat,
    backMat,
    baseX,
    swayZ: 0,
    swayVelZ: 0,
    tagSwayZ: 0,
    unhookProgress: 0,
    flipAngle: 0,
    inspectYaw: 0,
    disposables,
  };
}
