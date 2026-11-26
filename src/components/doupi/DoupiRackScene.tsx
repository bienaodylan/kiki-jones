import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Product } from '../../types/commerce';
import {
  GARMENT_SPACING,
  GarmentRig,
  RACK_RAIL_Y,
  createAtelierRack,
  createGarmentRig,
  createSharedAtelierAssets,
} from './doupiRackGeometry';

interface DoupiRackSceneProps {
  products: Product[];
  selectedIndex: number | null;
  viewSide: 'front' | 'back';
  externalScrollIndex: number | null;
  onSelectIndex: (index: number | null) => void;
  onCenterChange: (index: number) => void;
  onWebGLUnavailable: () => void;
}

function detectSoftwareGl(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return false;
    const rendererStr = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
    return /SwiftShader|llvmpipe|Software|Mesa OffScreen|Basic Render/i.test(rendererStr);
  } catch {
    return false;
  }
}

export function DoupiRackScene({
  products,
  selectedIndex,
  viewSide,
  externalScrollIndex,
  onSelectIndex,
  onCenterChange,
  onWebGLUnavailable,
}: DoupiRackSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reactive refs synced from React props into the 60fps Three.js loop without rebuilding WebGL
  const selectedIndexRef = useRef<number | null>(selectedIndex);
  const viewSideRef = useRef<'front' | 'back'>(viewSide);
  const onSelectRef = useRef(onSelectIndex);
  const onCenterRef = useRef(onCenterChange);
  const onWebGLFailRef = useRef(onWebGLUnavailable);

  // Target scroll X exposed to external navigation buttons / scrubber
  const scrollTargetRef = useRef<number>(0);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
    if (selectedIndex !== null) {
      scrollTargetRef.current = selectedIndex * GARMENT_SPACING;
    }
  }, [selectedIndex]);

  useEffect(() => {
    viewSideRef.current = viewSide;
  }, [viewSide]);

  useEffect(() => {
    onSelectRef.current = onSelectIndex;
    onCenterRef.current = onCenterChange;
    onWebGLFailRef.current = onWebGLUnavailable;
  }, [onSelectIndex, onCenterChange, onWebGLUnavailable]);

  useEffect(() => {
    if (externalScrollIndex !== null && products.length > 0) {
      const clamped = Math.max(0, Math.min(products.length - 1, externalScrollIndex));
      scrollTargetRef.current = clamped * GARMENT_SPACING;
    }
  }, [externalScrollIndex, products.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || products.length === 0) return;

    // Probe WebGL availability & software renderer before creating main renderer
    let isSoftwareGl = false;
    try {
      const probeCanvas = document.createElement('canvas');
      const probeGl =
        probeCanvas.getContext('webgl2') ||
        probeCanvas.getContext('webgl');
      if (!probeGl) {
        onWebGLFailRef.current();
        return;
      }
      isSoftwareGl = detectSoftwareGl(probeGl);
    } catch {
      onWebGLFailRef.current();
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      onWebGLFailRef.current();
      return;
    }

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const castShadows = !isSoftwareGl;

    // Scene — Bright, serene luxury boutique-atelier cyclorama
    const studioBgColor = 0xf4f3ef;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(studioBgColor);
    scene.fog = new THREE.Fog(studioBgColor, 11, 26);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 60);
    const isMobileViewport = () => container.clientWidth < 768;
    const getBaseCameraZ = () => (isMobileViewport() ? 6.15 : 5.35);
    camera.position.set(0, 0.62, getBaseCameraZ());
    camera.lookAt(0, 0.56, 0);

    // PMREM Studio Environment for realistic chrome reflections on the metallic rail & hooks
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmrem.dispose();

    // Editorial 3-Point Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe8e4dc, 1.05);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf2, 1.35);
    keyLight.position.set(4.5, 7.2, 6.4);
    if (castShadows) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 24;
      keyLight.shadow.camera.left = -12;
      keyLight.shadow.camera.right = 12;
      keyLight.shadow.camera.top = 6;
      keyLight.shadow.camera.bottom = -4;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xeef2f8, 0.55);
    rimLight.position.set(-5.0, 4.5, -4.5);
    scene.add(rimLight);

    // Seamless Atelier Floor Plane + Subtle Gallery Baseboard Line
    const floorGeom = new THREE.PlaneGeometry(140, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf1efe9,
      roughness: 0.92,
      metalness: 0.0,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -0.68, 0);
    floorMesh.receiveShadow = castShadows;
    scene.add(floorMesh);

    const baseboardGeom = new THREE.PlaneGeometry(140, 0.018);
    const baseboardMat = new THREE.MeshBasicMaterial({
      color: 0xd9d6ce,
      transparent: true,
      opacity: 0.7,
    });
    const baseboardMesh = new THREE.Mesh(baseboardGeom, baseboardMat);
    baseboardMesh.position.set(0, -0.66, -3.4);
    scene.add(baseboardMesh);

    // Shared geometries/materials + Rack Group
    const sharedAssets = createSharedAtelierAssets();
    const rackWorldGroup = new THREE.Group();
    scene.add(rackWorldGroup);

    const rackStructure = createAtelierRack(products.length, sharedAssets, castShadows);
    rackWorldGroup.add(rackStructure.group);

    // Create hanging garment rigs
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const rigs: GarmentRig[] = products.map((product, idx) => {
      const effectivePrice =
        typeof product.promoPriceXof === 'number' && product.promoPriceXof > 0
          ? product.promoPriceXof
          : product.regularPriceXof;
      const frontImage = product.images?.[0] || '';
      const backImage = product.images?.[1] || product.runwayModelImageUrl || frontImage;

      const rig = createGarmentRig({
        index: idx,
        productId: product.id,
        productName: product.name,
        priceXof: effectivePrice,
        frontImageUrl: frontImage,
        backImageUrl: backImage,
        assets: sharedAssets,
        textureLoader,
        maxAnisotropy,
        castShadows,
      });

      rackWorldGroup.add(rig.rootGroup);
      rackWorldGroup.add(rig.shadowMesh);
      return rig;
    });

    // Studio depth-focus scrim plane (fades softly behind the unhooked garment to dim the rack)
    const scrimGeom = new THREE.PlaneGeometry(26, 16);
    const scrimMat = new THREE.MeshBasicMaterial({
      color: 0xefeee9,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const scrimMesh = new THREE.Mesh(scrimGeom, scrimMat);
    scrimMesh.position.set(0, 0.65, 0.95);
    scrimMesh.renderOrder = 2;
    scene.add(scrimMesh);

    // Start centered near index 0 (or slightly in if > 3 pieces for immediate gallery feel)
    const maxScrollX = Math.max(0, (products.length - 1) * GARMENT_SPACING);
    const initialIndex = products.length >= 4 ? 1 : 0;
    let scrollCurrent = initialIndex * GARMENT_SPACING;
    scrollTargetRef.current = scrollCurrent;
    let lastReportedCenter = initialIndex;
    onCenterRef.current(initialIndex);

    // Interaction state (reusable vectors outside render loop)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    const hitTargets = rigs.map((r) => r.hitMesh);

    let isDragging = false;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let lastPointerX = 0;
    let dragDistance = 0;
    let pointerVelocity = 0;
    let hoveredIndex: number | null = null;
    let inspectUserYaw = 0;

    const clampScroll = (val: number) => Math.max(0, Math.min(maxScrollX, val));

    const updatePointerNdc = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pickGarmentAt = (clientX: number, clientY: number): number | null => {
      updatePointerNdc(clientX, clientY);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitTargets, false);
      if (hits.length > 0) {
        const idx = hits[0].object.userData?.garmentIndex;
        if (typeof idx === 'number') return idx;
      }
      return null;
    };

    const onWheel = (e: WheelEvent) => {
      if (selectedIndexRef.current !== null) return;
      e.preventDefault();
      const rawDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scrollTargetRef.current = clampScroll(scrollTargetRef.current + rawDelta * 0.0036);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      isDragging = true;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      lastPointerX = e.clientX;
      dragDistance = 0;
      pointerVelocity = 0;
      try {
        renderer.domElement.setPointerCapture(e.pointerId);
      } catch {
        // ignore capture errors
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastPointerX;
        lastPointerX = e.clientX;
        dragDistance += Math.abs(dx) + Math.abs(e.clientY - pointerDownY) * 0.05;

        if (selectedIndexRef.current !== null) {
          // Gentle 3D spin inspection on the unhooked garment
          inspectUserYaw = Math.max(-0.55, Math.min(0.55, inspectUserYaw + dx * 0.0055));
        } else {
          const factor = isMobileViewport() ? 0.0082 : 0.0058;
          scrollTargetRef.current = clampScroll(scrollTargetRef.current - dx * factor);
          pointerVelocity = -dx * factor;
        }
        return;
      }

      // Hover cursor feedback on desktop
      if (e.pointerType === 'mouse') {
        const hit = pickGarmentAt(e.clientX, e.clientY);
        hoveredIndex = hit;
        if (selectedIndexRef.current !== null) {
          renderer.domElement.style.cursor =
            hit === selectedIndexRef.current ? 'grab' : 'pointer';
        } else {
          renderer.domElement.style.cursor = hit !== null ? 'pointer' : 'grab';
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      const moved = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);

      if (moved < 9 && dragDistance < 12) {
        // Clean click / tap
        const hitIdx = pickGarmentAt(e.clientX, e.clientY);
        if (selectedIndexRef.current !== null) {
          if (hitIdx === null || hitIdx !== selectedIndexRef.current) {
            inspectUserYaw = 0;
            onSelectRef.current(null);
          }
        } else if (hitIdx !== null) {
          inspectUserYaw = 0;
          scrollTargetRef.current = hitIdx * GARMENT_SPACING;
          onSelectRef.current(hitIdx);
        }
      } else if (selectedIndexRef.current === null) {
        // Smooth momentum flick release
        scrollTargetRef.current = clampScroll(scrollTargetRef.current + pointerVelocity * 7.5);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedIndexRef.current !== null) {
        inspectUserYaw = 0;
        onSelectRef.current(null);
        return;
      }
      if (selectedIndexRef.current === null) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = Math.min(products.length - 1, lastReportedCenter + 1);
          scrollTargetRef.current = next * GARMENT_SPACING;
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = Math.max(0, lastReportedCenter - 1);
          scrollTargetRef.current = prev * GARMENT_SPACING;
        } else if (e.key === 'Enter') {
          e.preventDefault();
          inspectUserYaw = 0;
          onSelectRef.current(lastReportedCenter);
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('wheel', onWheel, { passive: false });
    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('keydown', onKeyDown);

    // Responsive resize observer
    const onResize = () => {
      const nextW = Math.max(1, container.clientWidth);
      const nextH = Math.max(1, container.clientHeight);
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH, false);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // GPU-completion pacing helper for software WebGL (from Three.js best practices)
    const glCtx = renderer.getContext();
    const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && glCtx instanceof WebGL2RenderingContext;
    let rafId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      if (disposed) return;
      if (!isSoftwareGl || !isWebGL2) {
        rafId = window.requestAnimationFrame(cb);
        return;
      }
      const gl2 = glCtx as WebGL2RenderingContext;
      const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        rafId = window.requestAnimationFrame(cb);
        return;
      }
      gl2.flush();
      const poll = () => {
        if (disposed) {
          gl2.deleteSync(sync);
          return;
        }
        const status = gl2.clientWaitSync(sync, 0, 0);
        if (status === gl2.ALREADY_SIGNALED || status === gl2.CONDITION_SATISFIED) {
          gl2.deleteSync(sync);
          rafId = window.requestAnimationFrame(cb);
        } else if (status === gl2.WAIT_FAILED) {
          gl2.deleteSync(sync);
          rafId = window.requestAnimationFrame(cb);
        } else {
          rafId = window.requestAnimationFrame(poll);
        }
      };
      rafId = window.requestAnimationFrame(poll);
    };

    // Main 60fps Cinematic Loop
    let lastTime = performance.now();
    let elapsed = 0;
    let scrimOpacity = 0;
    let cameraZ = getBaseCameraZ();

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      elapsed += dt;

      const selectedIdx = selectedIndexRef.current;
      const mobile = isMobileViewport();

      // Smooth exponential scroll damping (Lenis-style inertia)
      const prevScroll = scrollCurrent;
      scrollCurrent = THREE.MathUtils.damp(scrollCurrent, scrollTargetRef.current, 6.2, dt);
      const scrollVelocity = (scrollCurrent - prevScroll) / dt;

      // Keep rack translated laterally opposite to scrollCurrent
      rackWorldGroup.position.x = -scrollCurrent;

      // Track closest garment to center
      const rawCenterIdx = Math.round(scrollCurrent / GARMENT_SPACING);
      const clampedCenterIdx = Math.max(0, Math.min(products.length - 1, rawCenterIdx));
      if (clampedCenterIdx !== lastReportedCenter) {
        lastReportedCenter = clampedCenterIdx;
        onCenterRef.current(clampedCenterIdx);
      }

      // Camera subtle zoom & breathing
      const targetCamZ = selectedIdx !== null ? (mobile ? 5.65 : 4.85) : getBaseCameraZ();
      cameraZ = THREE.MathUtils.damp(cameraZ, targetCamZ, 5.2, dt);
      camera.position.z = cameraZ;

      // Dimming studio scrim smoothly fades in when inspecting a piece
      const targetScrim = selectedIdx !== null ? 0.72 : 0;
      scrimOpacity = THREE.MathUtils.damp(scrimOpacity, targetScrim, 6.5, dt);
      scrimMat.opacity = scrimOpacity;
      scrimMesh.visible = scrimOpacity > 0.005;

      // Slowly relax user inspection yaw when switching to another piece or closing
      if (selectedIdx === null) {
        inspectUserYaw = THREE.MathUtils.damp(inspectUserYaw, 0, 6, dt);
      }

      // Animate every hanging garment rig
      for (let i = 0; i < rigs.length; i++) {
        const rig = rigs[i];
        const isSelected = selectedIdx === i;
        const isHovered = selectedIdx === null && hoveredIndex === i;

        // Horizontal distance from screen center (in world units)
        const worldX = rig.baseX - scrollCurrent;
        const distFromCenter = Math.abs(worldX);
        const centerProximity = Math.exp(-Math.pow(distFromCenter / 1.45, 2)); // 1 at center, 0 far

        // 1. Unhook progress (0 = hanging on rail, 1 = floating forward for inspection)
        rig.unhookProgress = THREE.MathUtils.damp(
          rig.unhookProgress,
          isSelected ? 1 : 0,
          5.8,
          dt
        );
        const u = rig.unhookProgress;

        // 2. Pendulum spring sway driven by horizontal scroll velocity (natural hanging inertia)
        const velocityImpulse = Math.max(-0.42, Math.min(0.42, scrollVelocity * 0.036));
        const ambientBreeze = Math.sin(elapsed * 1.15 + i * 0.85) * 0.0065;
        const springK = 26;
        const dampingC = 5.4;
        const targetSway = (velocityImpulse + ambientBreeze) * (1 - u);
        const accel = (targetSway - rig.swayZ) * springK - rig.swayVelZ * dampingC;
        rig.swayVelZ += accel * dt;
        rig.swayZ += rig.swayVelZ * dt;

        // Subtle secondary price tag inertia
        rig.tagSwayZ = THREE.MathUtils.damp(
          rig.tagSwayZ,
          rig.swayZ * 1.45 + Math.sin(elapsed * 1.9 + i) * 0.015,
          8,
          dt
        );
        rig.tagPivot.rotation.z = rig.tagSwayZ;

        // 3. Center emphasis + parallax depth + hover lift
        const rackScale =
          0.92 +
          centerProximity * 0.16 +
          (isHovered ? 0.035 : 0);
        const inspectScale = mobile ? 1.02 : 1.16;
        const finalScale = THREE.MathUtils.lerp(rackScale, inspectScale, u);

        const rackZ =
          -0.14 +
          centerProximity * 0.42 +
          (isHovered ? 0.1 : 0) -
          (selectedIdx !== null && !isSelected ? 0.45 : 0);

        // When unhooked: bring forward in front of scrim (scrim at z=0.95) & frame beside product panel
        const inspectTargetX = mobile ? 0 : -0.78;
        const inspectTargetY = mobile ? 0.34 : 0.06;
        const inspectTargetZ = mobile ? 1.85 : 2.15;

        // Smooth lift-off arc while unhooking
        const liftArcY = Math.sin(u * Math.PI) * 0.16;
        const floatY = u * Math.sin(elapsed * 1.6) * 0.018;

        // Local X offset to move from baseX to inspectTargetX in world space
        const desiredWorldX = THREE.MathUtils.lerp(worldX, inspectTargetX, u);
        rig.swingGroup.position.x = desiredWorldX - worldX;
        rig.swingGroup.position.y =
          THREE.MathUtils.lerp(0, inspectTargetY, u) + liftArcY + floatY;
        rig.swingGroup.position.z = THREE.MathUtils.lerp(rackZ, inspectTargetZ, u);
        rig.swingGroup.scale.setScalar(finalScale);
        rig.swingGroup.rotation.z = rig.swayZ;

        // 4. Rotation: scroll-velocity yaw + subtle perspective arc on rack + 180° Front/Back flip on inspect
        const scrollYaw = Math.max(-0.24, Math.min(0.24, -scrollVelocity * 0.042));
        const rackArcYaw = THREE.MathUtils.clamp(-worldX * 0.065, -0.22, 0.22);
        const desiredFlip = isSelected && viewSideRef.current === 'back' ? Math.PI : 0;
        rig.flipAngle = THREE.MathUtils.damp(rig.flipAngle, desiredFlip, 6.4, dt);

        const inspectAngle =
          (mobile ? 0 : 0.12) +
          Math.sin(elapsed * 0.85) * 0.035 +
          (isSelected ? inspectUserYaw : 0);

        const baseYaw = THREE.MathUtils.lerp(rackArcYaw + scrollYaw, inspectAngle, u);
        rig.cardGroup.rotation.y = baseYaw + rig.flipAngle;

        // Slight backward tilt when scrolling fast (hanging fabric air resistance)
        const dragTiltX = Math.min(0.08, Math.abs(scrollVelocity) * 0.012) * (1 - u);
        rig.cardGroup.rotation.x = THREE.MathUtils.damp(
          rig.cardGroup.rotation.x,
          dragTiltX,
          7,
          dt
        );

        // Keep inspected garment rendered cleanly above scrim
        rig.rootGroup.renderOrder = isSelected ? 5 : 1;

        // Soft floor contact shadow follows X and fades as garment unhooks upward
        const shadowMat = rig.shadowMesh.material as THREE.MeshBasicMaterial;
        shadowMat.opacity = (0.48 + centerProximity * 0.28) * (1 - u * 0.85);
        rig.shadowMesh.scale.set(
          1 + centerProximity * 0.12,
          1,
          1
        );
      }

      renderer.render(scene, camera);
      afterDraw(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      domEl.removeEventListener('wheel', onWheel);
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);

      for (const rig of rigs) {
        for (const d of rig.disposables) d.dispose();
      }
      for (const d of rackStructure.disposables) d.dispose();
      sharedAssets.dispose();
      floorGeom.dispose();
      floorMat.dispose();
      baseboardGeom.dispose();
      baseboardMat.dispose();
      scrimGeom.dispose();
      scrimMat.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (domEl.parentNode === container) {
        container.removeChild(domEl);
      }
    };
  }, [products]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#F4F3EF]"
      aria-label="Kiki Jones Doupi 3D Atelier Showroom"
    />
  );
}
