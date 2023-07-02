import {
  REVISION,
  BackSide,
  FrontSide,
  DoubleSide,
  UnsignedByteType,
  NoToneMapping,
  SRGBColorSpace,
  LinearSRGBColorSpace,
  RGBAIntegerFormat,
  RGIntegerFormat,
  UnsignedIntType,
  UnsignedShortType,
  UnsignedInt248Type,
  UnsignedShort4444Type,
  UnsignedShort5551Type,
} from "three/src/constants.js";
import { Color } from "three/src/math/Color.js";
import { Frustum } from "three/src/math/Frustum.js";
import { Matrix4 } from "three/src/math/Matrix4.js";
import { Vector2 } from "three/src/math/Vector2.js";
import { Vector3 } from "three/src/math/Vector3.js";
import { Vector4 } from "three/src/math/Vector4.js";
import { WebGLAttributes } from "three/src/renderers/webgl/WebGLAttributes.js";
import { WebGLBackground } from "three/src/renderers/webgl/WebGLBackground.js";
import { WebGLBindingStates } from "three/src/renderers/webgl/WebGLBindingStates.js";
import { WebGLBufferRenderer } from "three/src/renderers/webgl/WebGLBufferRenderer.js";
import { WebGLCapabilities } from "three/src/renderers/webgl/WebGLCapabilities.js";
import { WebGLClipping } from "three/src/renderers/webgl/WebGLClipping.js";
import { WebGLCubeMaps } from "three/src/renderers/webgl/WebGLCubeMaps.js";
import { WebGLCubeUVMaps } from "three/src/renderers/webgl/WebGLCubeUVMaps.js";
import { WebGLExtensions } from "three/src/renderers/webgl/WebGLExtensions.js";
import { WebGLGeometries } from "three/src/renderers/webgl/WebGLGeometries.js";
import { WebGLIndexedBufferRenderer } from "three/src/renderers/webgl/WebGLIndexedBufferRenderer.js";
import { WebGLInfo } from "three/src/renderers/webgl/WebGLInfo.js";
import { WebGLMorphtargets } from "three/src/renderers/webgl/WebGLMorphtargets.js";
import { WebGLObjects } from "three/src/renderers/webgl/WebGLObjects.js";
import { WebGLPrograms } from "three/src/renderers/webgl/WebGLPrograms.js";
import { WebGLProperties } from "three/src/renderers/webgl/WebGLProperties.js";
import { WebGLRenderLists } from "three/src/renderers/webgl/WebGLRenderLists.js";
import { WebGLRenderStates } from "three/src/renderers/webgl/WebGLRenderStates.js";
import { WebGLShadowMap } from "three/src/renderers/webgl/WebGLShadowMap.js";
import { WebGLState } from "three/src/renderers/webgl/WebGLState.js";
import { WebGLTextures } from "three/src/renderers/webgl/WebGLTextures.js";
import { WebGLUniforms } from "three/src/renderers/webgl/WebGLUniforms.js";
import { WebGLUtils } from "three/src/renderers/webgl/WebGLUtils.js";
import { WebXRManager } from "three/src/renderers/webxr/WebXRManager.js";
import { WebGLMaterials } from "three/src/renderers/webgl/WebGLMaterials.js";
import { WebGLUniformsGroups } from "three/src/renderers/webgl/WebGLUniformsGroups.js";

class WebGLRenderer {
  constructor(parameters = {}) {
    const {
      canvas = createCanvasElement(),
      context = null,
      depth = true,
      stencil = true,
      alpha = false,
      antialias = false,
      premultipliedAlpha = true,
      preserveDrawingBuffer = false,
      powerPreference = "default",
      failIfMajorPerformanceCaveat = false,
    } = parameters;

    this.isWebGLRenderer = true;

    let _alpha;

    if (context !== null) {
      _alpha = context.getContextAttributes().alpha;
    } else {
      _alpha = alpha;
    }

    const uintClearColor = new Uint32Array(4);
    const intClearColor = new Int32Array(4);

    let currentRenderList = null;
    let currentRenderState = null;

    // render() can be called from within a callback triggered by another render.
    // We track this so that the nested render call gets its list and state isolated from the parent render call.

    const renderListStack = [];
    const renderStateStack = [];

    // public properties

    this.domElement = canvas;

    // Debug configuration container
    this.debug = {
      /**
       * Enables error checking and reporting when shader programs are being compiled
       * @type {boolean}
       */
      checkShaderErrors: true,
      /**
       * Callback for custom error reporting.
       * @type {?Function}
       */
      onShaderError: null,
    };

    // clearing

    this.autoClear = true;
    this.autoClearColor = true;
    this.autoClearDepth = true;
    this.autoClearStencil = true;

    // scene graph

    this.sortObjects = true;

    // user-defined clipping

    this.clippingPlanes = [];
    this.localClippingEnabled = false;

    // physically based shading

    this.outputColorSpace = SRGBColorSpace;

    // physical lights

    this.useLegacyLights = true;

    // tone mapping

    this.toneMapping = NoToneMapping;
    this.toneMappingExposure = 1.0;

    // internal properties

    const _this = this;

    let _isContextLost = false;

    // internal state cache

    let _currentActiveCubeFace = 0;
    let _currentActiveMipmapLevel = 0;
    let _currentRenderTarget = null;
    let _currentMaterialId = -1;

    let _currentCamera = null;

    const _currentViewport = new Vector4();
    const _currentScissor = new Vector4();
    let _currentScissorTest = null;

    const _currentClearColor = new Color(0x000000);
    let _currentClearAlpha = 0;

    //

    let _width = canvas.width;
    let _height = canvas.height;

    let _pixelRatio = 1;
    let _opaqueSort = null;
    let _transparentSort = null;

    const _viewport = new Vector4(0, 0, _width, _height);
    const _scissor = new Vector4(0, 0, _width, _height);
    let _scissorTest = false;

    // frustum

    const _frustum = new Frustum();

    // clipping

    let _clippingEnabled = false;
    let _localClippingEnabled = false;

    // transmission

    let _transmissionRenderTarget = null;

    // camera matrices cache

    const _projScreenMatrix = new Matrix4();

    const _vector2 = new Vector2();
    const _vector3 = new Vector3();

    const _emptyScene = {
      background: null,
      fog: null,
      environment: null,
      overrideMaterial: null,
      isScene: true,
    };

    // initialize

    let _gl = context;

    function getContext(contextNames, contextAttributes) {
      for (let i = 0; i < contextNames.length; i++) {
        const contextName = contextNames[i];
        const context = canvas.getContext(contextName, contextAttributes);
        if (context !== null) return context;
      }

      return null;
    }

    try {
      const contextAttributes = {
        alpha: true,
        depth,
        stencil,
        antialias,
        premultipliedAlpha,
        preserveDrawingBuffer,
        powerPreference,
        failIfMajorPerformanceCaveat,
      };

      // OffscreenCanvas does not have setAttribute, see #22811
      if ("setAttribute" in canvas)
        canvas.setAttribute("data-engine", `three.js r${REVISION}`);

      if (_gl === null) {
        const contextNames = ["webgl2", "webgl", "experimental-webgl"];

        if (_this.isWebGL1Renderer === true) {
          contextNames.shift();
        }

        _gl = getContext(contextNames, contextAttributes);

        if (_gl === null) {
          if (getContext(contextNames)) {
            throw new Error(
              "Error creating WebGL context with your selected attributes."
            );
          } else {
            throw new Error("Error creating WebGL context.");
          }
        }
      }
    } catch (error) {
      console.error("THREE.WebGLRenderer: " + error.message);
      throw error;
    }

    let extensions, capabilities, state, info;
    let properties,
      textures,
      cubemaps,
      cubeuvmaps,
      attributes,
      geometries,
      objects;
    let programCache, materials, renderLists, renderStates, clipping, shadowMap;

    let background, morphtargets, bufferRenderer, indexedBufferRenderer;

    let utils, bindingStates, uniformsGroups;

    function initGLContext() {
      extensions = new WebGLExtensions(_gl);

      capabilities = new WebGLCapabilities(_gl, extensions, parameters);

      extensions.init(capabilities);

      utils = new WebGLUtils(_gl, extensions, capabilities);

      state = new WebGLState(_gl, extensions, capabilities);

      info = new WebGLInfo(_gl);
      properties = new WebGLProperties();
      textures = new WebGLTextures(
        _gl,
        extensions,
        state,
        properties,
        capabilities,
        utils,
        info
      );
      cubemaps = new WebGLCubeMaps(_this);
      cubeuvmaps = new WebGLCubeUVMaps(_this);
      attributes = new WebGLAttributes(_gl, capabilities);
      bindingStates = new WebGLBindingStates(
        _gl,
        extensions,
        attributes,
        capabilities
      );
      geometries = new WebGLGeometries(_gl, attributes, info, bindingStates);
      objects = new WebGLObjects(_gl, geometries, attributes, info);
      morphtargets = new WebGLMorphtargets(_gl, capabilities, textures);
      clipping = new WebGLClipping(properties);
      programCache = new WebGLPrograms(
        _this,
        cubemaps,
        cubeuvmaps,
        extensions,
        capabilities,
        bindingStates,
        clipping
      );
      materials = new WebGLMaterials(_this, properties);
      renderLists = new WebGLRenderLists();
      renderStates = new WebGLRenderStates(extensions, capabilities);
      background = new WebGLBackground(
        _this,
        cubemaps,
        cubeuvmaps,
        state,
        objects,
        _alpha,
        premultipliedAlpha
      );
      shadowMap = new WebGLShadowMap(_this, objects, capabilities);
      uniformsGroups = new WebGLUniformsGroups(_gl, info, capabilities, state);

      bufferRenderer = new WebGLBufferRenderer(
        _gl,
        extensions,
        info,
        capabilities
      );
      indexedBufferRenderer = new WebGLIndexedBufferRenderer(
        _gl,
        extensions,
        info,
        capabilities
      );

      info.programs = programCache.programs;

      _this.capabilities = capabilities;
      _this.extensions = extensions;
      _this.properties = properties;
      _this.renderLists = renderLists;
      _this.shadowMap = shadowMap;
      _this.state = state;
      _this.info = info;
    }

    initGLContext();

    // xr

    const xr = new WebXRManager(_this, _gl);

    this.xr = xr;

    // API

    this.getContext = function () {
      return _gl;
    };

    this.setPixelRatio = function (value) {
      if (value === undefined) return;

      _pixelRatio = value;

      this.setSize(_width, _height, false);
    };

    this.setSize = function (width, height, updateStyle = true) {
      if (xr.isPresenting) {
        console.warn(
          "THREE.WebGLRenderer: Can't change size while VR device is presenting."
        );
        return;
      }

      _width = width;
      _height = height;

      canvas.width = Math.floor(width * _pixelRatio);
      canvas.height = Math.floor(height * _pixelRatio);

      if (updateStyle === true) {
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
      }

      this.setViewport(0, 0, width, height);
    };

    this.setViewport = function (x, y, width, height) {
      if (x.isVector4) {
        _viewport.set(x.x, x.y, x.z, x.w);
      } else {
        _viewport.set(x, y, width, height);
      }

      state.viewport(
        _currentViewport.copy(_viewport).multiplyScalar(_pixelRatio).floor()
      );
    };

    this.clear = function (color = true, depth = true, stencil = true) {
      let bits = 0;

      if (color) {
        // check if we're trying to clear an integer target
        let isIntegerFormat = false;
        if (_currentRenderTarget !== null) {
          const targetFormat = _currentRenderTarget.texture.format;
          isIntegerFormat =
            targetFormat === RGBAIntegerFormat ||
            targetFormat === RGIntegerFormat ||
            targetFormat === RedIntegerFormat;
        }

        // use the appropriate clear functions to clear the target if it's a signed
        // or unsigned integer target
        if (isIntegerFormat) {
          const targetType = _currentRenderTarget.texture.type;
          const isUnsignedType =
            targetType === UnsignedByteType ||
            targetType === UnsignedIntType ||
            targetType === UnsignedShortType ||
            targetType === UnsignedInt248Type ||
            targetType === UnsignedShort4444Type ||
            targetType === UnsignedShort5551Type;

          const clearColor = background.getClearColor();
          const a = background.getClearAlpha();
          const r = clearColor.r;
          const g = clearColor.g;
          const b = clearColor.b;

          if (isUnsignedType) {
            uintClearColor[0] = r;
            uintClearColor[1] = g;
            uintClearColor[2] = b;
            uintClearColor[3] = a;
            _gl.clearBufferuiv(_gl.COLOR, 0, uintClearColor);
          } else {
            intClearColor[0] = r;
            intClearColor[1] = g;
            intClearColor[2] = b;
            intClearColor[3] = a;
            _gl.clearBufferiv(_gl.COLOR, 0, intClearColor);
          }
        } else {
          bits |= _gl.COLOR_BUFFER_BIT;
        }
      }

      if (depth) bits |= _gl.DEPTH_BUFFER_BIT;
      if (stencil) bits |= _gl.STENCIL_BUFFER_BIT;

      _gl.clear(bits);
    };

    // Buffer rendering

    this.renderBufferDirect = function (
      camera,
      scene,
      geometry,
      material,
      object,
      group
    ) {
      if (scene === null) scene = _emptyScene; // renderBufferDirect second parameter used to be fog (could be null)

      const frontFaceCW = object.isMesh && object.matrixWorld.determinant() < 0;

      const program = setProgram(camera, scene, geometry, material, object);

      state.setMaterial(material, frontFaceCW);

      //

      let index = geometry.index;
      let rangeFactor = 1;

      if (material.wireframe === true) {
        index = geometries.getWireframeAttribute(geometry);
        rangeFactor = 2;
      }

      //

      const drawRange = geometry.drawRange;
      const position = geometry.attributes.position;

      let drawStart = drawRange.start * rangeFactor;
      let drawEnd = (drawRange.start + drawRange.count) * rangeFactor;

      if (group !== null) {
        drawStart = Math.max(drawStart, group.start * rangeFactor);
        drawEnd = Math.min(drawEnd, (group.start + group.count) * rangeFactor);
      }

      if (index !== null) {
        drawStart = Math.max(drawStart, 0);
        drawEnd = Math.min(drawEnd, index.count);
      } else if (position !== undefined && position !== null) {
        drawStart = Math.max(drawStart, 0);
        drawEnd = Math.min(drawEnd, position.count);
      }

      const drawCount = drawEnd - drawStart;

      if (drawCount < 0 || drawCount === Infinity) return;

      //

      bindingStates.setup(object, material, program, geometry, index);

      let attribute;
      let renderer = bufferRenderer;

      if (index !== null) {
        attribute = attributes.get(index);

        renderer = indexedBufferRenderer;
        renderer.setIndex(attribute);
      }

      //

      if (object.isMesh) {
        if (material.wireframe === true) {
          state.setLineWidth(
            material.wireframeLinewidth * getTargetPixelRatio()
          );
          renderer.setMode(_gl.LINES);
        } else {
          renderer.setMode(_gl.TRIANGLES);
        }
      } else if (object.isLine) {
        let lineWidth = material.linewidth;

        if (lineWidth === undefined) lineWidth = 1; // Not using Line*Material

        state.setLineWidth(lineWidth * getTargetPixelRatio());

        if (object.isLineSegments) {
          renderer.setMode(_gl.LINES);
        } else if (object.isLineLoop) {
          renderer.setMode(_gl.LINE_LOOP);
        } else {
          renderer.setMode(_gl.LINE_STRIP);
        }
      } else if (object.isPoints) {
        renderer.setMode(_gl.POINTS);
      } else if (object.isSprite) {
        renderer.setMode(_gl.TRIANGLES);
      }

      if (object.isInstancedMesh) {
        renderer.renderInstances(drawStart, drawCount, object.count);
      } else if (geometry.isInstancedBufferGeometry) {
        const maxInstanceCount =
          geometry._maxInstanceCount !== undefined
            ? geometry._maxInstanceCount
            : Infinity;
        const instanceCount = Math.min(
          geometry.instanceCount,
          maxInstanceCount
        );

        renderer.renderInstances(drawStart, drawCount, instanceCount);
      } else {
        renderer.render(drawStart, drawCount);
      }
    };

    // Compile

    this.render = function (scene, camera) {
      if (camera !== undefined && camera.isCamera !== true) {
        console.error(
          "THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera."
        );
        return;
      }

      if (_isContextLost === true) return;

      // update scene graph

      if (scene.matrixWorldAutoUpdate === true) scene.updateMatrixWorld();

      // update camera matrices and frustum

      if (camera.parent === null && camera.matrixWorldAutoUpdate === true)
        camera.updateMatrixWorld();

      if (xr.enabled === true && xr.isPresenting === true) {
        if (xr.cameraAutoUpdate === true) xr.updateCamera(camera);

        camera = xr.getCamera(); // use XR camera for rendering
      }

      //
      if (scene.isScene === true)
        scene.onBeforeRender(_this, scene, camera, _currentRenderTarget);

      currentRenderState = renderStates.get(scene, renderStateStack.length);
      currentRenderState.init();

      renderStateStack.push(currentRenderState);

      _projScreenMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );
      _frustum.setFromProjectionMatrix(_projScreenMatrix);

      _localClippingEnabled = this.localClippingEnabled;
      _clippingEnabled = clipping.init(
        this.clippingPlanes,
        _localClippingEnabled
      );

      currentRenderList = renderLists.get(scene, renderListStack.length);
      currentRenderList.init();

      renderListStack.push(currentRenderList);

      projectObject(scene, camera, 0, _this.sortObjects);

      currentRenderList.finish();

      if (_this.sortObjects === true) {
        currentRenderList.sort(_opaqueSort, _transparentSort);
      }

      //

      this.info.render.frame++;

      if (_clippingEnabled === true) clipping.beginShadows();

      const shadowsArray = currentRenderState.state.shadowsArray;

      shadowMap.render(shadowsArray, scene, camera);

      if (_clippingEnabled === true) clipping.endShadows();

      //

      if (this.info.autoReset === true) this.info.reset();

      //

      background.render(currentRenderList, scene);

      // render scene

      currentRenderState.setupLights(_this.useLegacyLights);

      if (camera.isArrayCamera) {
        const cameras = camera.cameras;

        for (let i = 0, l = cameras.length; i < l; i++) {
          const camera2 = cameras[i];

          renderScene(currentRenderList, scene, camera2, camera2.viewport);
        }
      } else {
        renderScene(currentRenderList, scene, camera);
      }

      //

      if (_currentRenderTarget !== null) {
        // resolve multisample renderbuffers to a single-sample texture if necessary

        textures.updateMultisampleRenderTarget(_currentRenderTarget);

        // Generate mipmap if we're using any kind of mipmap filtering

        textures.updateRenderTargetMipmap(_currentRenderTarget);
      }

      //

      if (scene.isScene === true) scene.onAfterRender(_this, scene, camera);

      // _gl.finish();

      bindingStates.resetDefaultState();
      _currentMaterialId = -1;
      _currentCamera = null;

      renderStateStack.pop();

      if (renderStateStack.length > 0) {
        currentRenderState = renderStateStack[renderStateStack.length - 1];
      } else {
        currentRenderState = null;
      }

      renderListStack.pop();

      if (renderListStack.length > 0) {
        currentRenderList = renderListStack[renderListStack.length - 1];
      } else {
        currentRenderList = null;
      }
    };

    function projectObject(object, camera, groupOrder, sortObjects) {
      if (object.visible === false) return;

      const visible = object.layers.test(camera.layers);

      if (visible) {
        if (object.isGroup) {
          groupOrder = object.renderOrder;
        } else if (object.isLOD) {
          if (object.autoUpdate === true) object.update(camera);
        } else if (object.isLight) {
          currentRenderState.pushLight(object);

          if (object.castShadow) {
            currentRenderState.pushShadow(object);
          }
        } else if (object.isSprite) {
          if (!object.frustumCulled || _frustum.intersectsSprite(object)) {
            if (sortObjects) {
              _vector3
                .setFromMatrixPosition(object.matrixWorld)
                .applyMatrix4(_projScreenMatrix);
            }

            const geometry = objects.update(object);
            const material = object.material;

            if (material.visible) {
              currentRenderList.push(
                object,
                geometry,
                material,
                groupOrder,
                _vector3.z,
                null
              );
            }
          }
        } else if (object.isMesh || object.isLine || object.isPoints) {
          if (!object.frustumCulled || _frustum.intersectsObject(object)) {
            const geometry = objects.update(object);
            const material = object.material;

            if (sortObjects) {
              if (object.boundingSphere !== undefined) {
                if (object.boundingSphere === null)
                  object.computeBoundingSphere();
                _vector3.copy(object.boundingSphere.center);
              } else {
                if (geometry.boundingSphere === null)
                  geometry.computeBoundingSphere();
                _vector3.copy(geometry.boundingSphere.center);
              }

              _vector3
                .applyMatrix4(object.matrixWorld)
                .applyMatrix4(_projScreenMatrix);
            }

            if (Array.isArray(material)) {
              const groups = geometry.groups;

              for (let i = 0, l = groups.length; i < l; i++) {
                const group = groups[i];
                const groupMaterial = material[group.materialIndex];

                if (groupMaterial && groupMaterial.visible) {
                  currentRenderList.push(
                    object,
                    geometry,
                    groupMaterial,
                    groupOrder,
                    _vector3.z,
                    group
                  );
                }
              }
            } else if (material.visible) {
              currentRenderList.push(
                object,
                geometry,
                material,
                groupOrder,
                _vector3.z,
                null
              );
            }
          }
        }
      }

      const children = object.children;

      for (let i = 0, l = children.length; i < l; i++) {
        projectObject(children[i], camera, groupOrder, sortObjects);
      }
    }

    function renderScene(currentRenderList, scene, camera, viewport) {
      const opaqueObjects = currentRenderList.opaque;
      const transmissiveObjects = currentRenderList.transmissive;
      const transparentObjects = currentRenderList.transparent;

      currentRenderState.setupLightsView(camera);

      if (_clippingEnabled === true)
        clipping.setGlobalState(_this.clippingPlanes, camera);

      if (transmissiveObjects.length > 0)
        renderTransmissionPass(
          opaqueObjects,
          transmissiveObjects,
          scene,
          camera
        );

      if (viewport) state.viewport(_currentViewport.copy(viewport));

      if (opaqueObjects.length > 0) renderObjects(opaqueObjects, scene, camera);
      if (transmissiveObjects.length > 0)
        renderObjects(transmissiveObjects, scene, camera);
      if (transparentObjects.length > 0)
        renderObjects(transparentObjects, scene, camera);

      // Ensure depth buffer writing is enabled so it can be cleared on next render

      state.buffers.depth.setTest(true);
      state.buffers.depth.setMask(true);
      state.buffers.color.setMask(true);

      state.setPolygonOffset(false);
    }

    function renderObjects(renderList, scene, camera) {
      const overrideMaterial =
        scene.isScene === true ? scene.overrideMaterial : null;

      for (let i = 0, l = renderList.length; i < l; i++) {
        const renderItem = renderList[i];

        const object = renderItem.object;
        const geometry = renderItem.geometry;
        const material =
          overrideMaterial === null ? renderItem.material : overrideMaterial;
        const group = renderItem.group;

        if (object.layers.test(camera.layers)) {
          renderObject(object, scene, camera, geometry, material, group);
        }
      }
    }

    function renderObject(object, scene, camera, geometry, material, group) {
      object.onBeforeRender(_this, scene, camera, geometry, material, group);

      object.modelViewMatrix.multiplyMatrices(
        camera.matrixWorldInverse,
        object.matrixWorld
      );
      object.normalMatrix.getNormalMatrix(object.modelViewMatrix);

      material.onBeforeRender(_this, scene, camera, geometry, object, group);

      if (
        material.transparent === true &&
        material.side === DoubleSide &&
        material.forceSinglePass === false
      ) {
        material.side = BackSide;
        material.needsUpdate = true;
        _this.renderBufferDirect(
          camera,
          scene,
          geometry,
          material,
          object,
          group
        );

        material.side = FrontSide;
        material.needsUpdate = true;
        _this.renderBufferDirect(
          camera,
          scene,
          geometry,
          material,
          object,
          group
        );

        material.side = DoubleSide;
      } else {
        _this.renderBufferDirect(
          camera,
          scene,
          geometry,
          material,
          object,
          group
        );
      }

      object.onAfterRender(_this, scene, camera, geometry, material, group);
    }

    function getProgram(material, scene, object) {
      if (scene.isScene !== true) scene = _emptyScene; // scene could be a Mesh, Line, Points, ...

      const materialProperties = properties.get(material);

      const lights = currentRenderState.state.lights;
      const shadowsArray = currentRenderState.state.shadowsArray;

      const lightsStateVersion = lights.state.version;

      const parameters = programCache.getParameters(
        material,
        lights.state,
        shadowsArray,
        scene,
        object
      );
      const programCacheKey = programCache.getProgramCacheKey(parameters);

      let programs = materialProperties.programs;

      // always update environment and fog - changing these trigger an getProgram call, but it's possible that the program doesn't change

      materialProperties.environment = material.isMeshStandardMaterial
        ? scene.environment
        : null;
      materialProperties.fog = scene.fog;
      materialProperties.envMap = (
        material.isMeshStandardMaterial ? cubeuvmaps : cubemaps
      ).get(material.envMap || materialProperties.environment);

      if (programs === undefined) {
        programs = new Map();
        materialProperties.programs = programs;
      }

      let program = programs.get(programCacheKey);

      if (program !== undefined) {
        // early out if program and light state is identical

        if (
          materialProperties.currentProgram === program &&
          materialProperties.lightsStateVersion === lightsStateVersion
        ) {
          updateCommonMaterialProperties(material, parameters);

          return program;
        }
      } else {
        parameters.uniforms = programCache.getUniforms(material);

        material.onBuild(object, parameters, _this);

        material.onBeforeCompile(parameters, _this);

        program = programCache.acquireProgram(parameters, programCacheKey);
        programs.set(programCacheKey, program);

        materialProperties.uniforms = parameters.uniforms;
      }

      const uniforms = materialProperties.uniforms;

      if (
        (!material.isShaderMaterial && !material.isRawShaderMaterial) ||
        material.clipping === true
      ) {
        uniforms.clippingPlanes = clipping.uniform;
      }

      updateCommonMaterialProperties(material, parameters);

      // store the light setup it was created for

      materialProperties.needsLights = materialNeedsLights(material);
      materialProperties.lightsStateVersion = lightsStateVersion;

      if (materialProperties.needsLights) {
        // wire up the material to this renderer's lighting state

        uniforms.ambientLightColor.value = lights.state.ambient;
        uniforms.lightProbe.value = lights.state.probe;
        uniforms.directionalLights.value = lights.state.directional;
        uniforms.directionalLightShadows.value = lights.state.directionalShadow;
        uniforms.spotLights.value = lights.state.spot;
        uniforms.spotLightShadows.value = lights.state.spotShadow;
        uniforms.rectAreaLights.value = lights.state.rectArea;
        uniforms.ltc_1.value = lights.state.rectAreaLTC1;
        uniforms.ltc_2.value = lights.state.rectAreaLTC2;
        uniforms.pointLights.value = lights.state.point;
        uniforms.pointLightShadows.value = lights.state.pointShadow;
        uniforms.hemisphereLights.value = lights.state.hemi;

        uniforms.directionalShadowMap.value = lights.state.directionalShadowMap;
        uniforms.directionalShadowMatrix.value =
          lights.state.directionalShadowMatrix;
        uniforms.spotShadowMap.value = lights.state.spotShadowMap;
        uniforms.spotLightMatrix.value = lights.state.spotLightMatrix;
        uniforms.spotLightMap.value = lights.state.spotLightMap;
        uniforms.pointShadowMap.value = lights.state.pointShadowMap;
        uniforms.pointShadowMatrix.value = lights.state.pointShadowMatrix;
        // TODO (abelnation): add area lights shadow info to uniforms
      }

      const progUniforms = program.getUniforms();
      const uniformsList = WebGLUniforms.seqWithValue(
        progUniforms.seq,
        uniforms
      );

      materialProperties.currentProgram = program;
      materialProperties.uniformsList = uniformsList;

      return program;
    }

    function updateCommonMaterialProperties(material, parameters) {
      const materialProperties = properties.get(material);

      materialProperties.outputColorSpace = parameters.outputColorSpace;
      materialProperties.instancing = parameters.instancing;
      materialProperties.skinning = parameters.skinning;
      materialProperties.morphTargets = parameters.morphTargets;
      materialProperties.morphNormals = parameters.morphNormals;
      materialProperties.morphColors = parameters.morphColors;
      materialProperties.morphTargetsCount = parameters.morphTargetsCount;
      materialProperties.numClippingPlanes = parameters.numClippingPlanes;
      materialProperties.numIntersection = parameters.numClipIntersection;
      materialProperties.vertexAlphas = parameters.vertexAlphas;
      materialProperties.vertexTangents = parameters.vertexTangents;
      materialProperties.toneMapping = parameters.toneMapping;
    }

    function setProgram(camera, scene, geometry, material, object) {
      if (scene.isScene !== true) scene = _emptyScene; // scene could be a Mesh, Line, Points, ...

      textures.resetTextureUnits();

      const fog = scene.fog;
      const environment = material.isMeshStandardMaterial
        ? scene.environment
        : null;
      const colorSpace =
        _currentRenderTarget === null
          ? _this.outputColorSpace
          : _currentRenderTarget.isXRRenderTarget === true
          ? _currentRenderTarget.texture.colorSpace
          : LinearSRGBColorSpace;
      const envMap = (
        material.isMeshStandardMaterial ? cubeuvmaps : cubemaps
      ).get(material.envMap || environment);
      const vertexAlphas =
        material.vertexColors === true &&
        !!geometry.attributes.color &&
        geometry.attributes.color.itemSize === 4;
      const vertexTangents =
        !!geometry.attributes.tangent &&
        (!!material.normalMap || material.anisotropy > 0);
      const morphTargets = !!geometry.morphAttributes.position;
      const morphNormals = !!geometry.morphAttributes.normal;
      const morphColors = !!geometry.morphAttributes.color;
      const toneMapping = material.toneMapped
        ? _this.toneMapping
        : NoToneMapping;

      const morphAttribute =
        geometry.morphAttributes.position ||
        geometry.morphAttributes.normal ||
        geometry.morphAttributes.color;
      const morphTargetsCount =
        morphAttribute !== undefined ? morphAttribute.length : 0;

      const materialProperties = properties.get(material);
      const lights = currentRenderState.state.lights;

      if (_clippingEnabled === true) {
        if (_localClippingEnabled === true || camera !== _currentCamera) {
          const useCache =
            camera === _currentCamera && material.id === _currentMaterialId;

          // we might want to call this function with some ClippingGroup
          // object instead of the material, once it becomes feasible
          // (#8465, #8379)
          clipping.setState(material, camera, useCache);
        }
      }

      //

      let needsProgramChange = false;

      if (material.version === materialProperties.__version) {
        if (
          materialProperties.needsLights &&
          materialProperties.lightsStateVersion !== lights.state.version
        ) {
          needsProgramChange = true;
        } else if (materialProperties.outputColorSpace !== colorSpace) {
          needsProgramChange = true;
        } else if (
          object.isInstancedMesh &&
          materialProperties.instancing === false
        ) {
          needsProgramChange = true;
        } else if (
          !object.isInstancedMesh &&
          materialProperties.instancing === true
        ) {
          needsProgramChange = true;
        } else if (
          object.isSkinnedMesh &&
          materialProperties.skinning === false
        ) {
          needsProgramChange = true;
        } else if (
          !object.isSkinnedMesh &&
          materialProperties.skinning === true
        ) {
          needsProgramChange = true;
        } else if (materialProperties.envMap !== envMap) {
          needsProgramChange = true;
        } else if (material.fog === true && materialProperties.fog !== fog) {
          needsProgramChange = true;
        } else if (
          materialProperties.numClippingPlanes !== undefined &&
          (materialProperties.numClippingPlanes !== clipping.numPlanes ||
            materialProperties.numIntersection !== clipping.numIntersection)
        ) {
          needsProgramChange = true;
        } else if (materialProperties.vertexAlphas !== vertexAlphas) {
          needsProgramChange = true;
        } else if (materialProperties.vertexTangents !== vertexTangents) {
          needsProgramChange = true;
        } else if (materialProperties.morphTargets !== morphTargets) {
          needsProgramChange = true;
        } else if (materialProperties.morphNormals !== morphNormals) {
          needsProgramChange = true;
        } else if (materialProperties.morphColors !== morphColors) {
          needsProgramChange = true;
        } else if (materialProperties.toneMapping !== toneMapping) {
          needsProgramChange = true;
        } else if (
          capabilities.isWebGL2 === true &&
          materialProperties.morphTargetsCount !== morphTargetsCount
        ) {
          needsProgramChange = true;
        }
      } else {
        needsProgramChange = true;
        materialProperties.__version = material.version;
      }

      //

      let program = materialProperties.currentProgram;

      if (needsProgramChange === true) {
        program = getProgram(material, scene, object);
      }

      let refreshProgram = false;
      let refreshMaterial = false;
      let refreshLights = false;

      const p_uniforms = program.getUniforms(),
        m_uniforms = materialProperties.uniforms;

      if (state.useProgram(program.program)) {
        refreshProgram = true;
        refreshMaterial = true;
        refreshLights = true;
      }

      if (material.id !== _currentMaterialId) {
        _currentMaterialId = material.id;

        refreshMaterial = true;
      }

      if (refreshProgram || _currentCamera !== camera) {
        p_uniforms.setValue(_gl, "projectionMatrix", camera.projectionMatrix);

        if (capabilities.logarithmicDepthBuffer) {
          p_uniforms.setValue(
            _gl,
            "logDepthBufFC",
            2.0 / (Math.log(camera.far + 1.0) / Math.LN2)
          );
        }

        if (_currentCamera !== camera) {
          _currentCamera = camera;

          // lighting uniforms depend on the camera so enforce an update
          // now, in case this material supports lights - or later, when
          // the next material that does gets activated:

          refreshMaterial = true; // set to true on material change
          refreshLights = true; // remains set until update done
        }

        // load material specific uniforms
        // (shader material also gets them for the sake of genericity)

        if (
          material.isShaderMaterial ||
          material.isMeshPhongMaterial ||
          material.isMeshToonMaterial ||
          material.isMeshStandardMaterial ||
          material.envMap
        ) {
          const uCamPos = p_uniforms.map.cameraPosition;

          if (uCamPos !== undefined) {
            uCamPos.setValue(
              _gl,
              _vector3.setFromMatrixPosition(camera.matrixWorld)
            );
          }
        }

        if (
          material.isMeshPhongMaterial ||
          material.isMeshToonMaterial ||
          material.isMeshLambertMaterial ||
          material.isMeshBasicMaterial ||
          material.isMeshStandardMaterial ||
          material.isShaderMaterial
        ) {
          p_uniforms.setValue(
            _gl,
            "isOrthographic",
            camera.isOrthographicCamera === true
          );
        }

        if (
          material.isMeshPhongMaterial ||
          material.isMeshToonMaterial ||
          material.isMeshLambertMaterial ||
          material.isMeshBasicMaterial ||
          material.isMeshStandardMaterial ||
          material.isShaderMaterial ||
          material.isShadowMaterial ||
          object.isSkinnedMesh
        ) {
          p_uniforms.setValue(_gl, "viewMatrix", camera.matrixWorldInverse);
        }
      }

      // skinning and morph target uniforms must be set even if material didn't change
      // auto-setting of texture unit for bone and morph texture must go before other textures
      // otherwise textures used for skinning and morphing can take over texture units reserved for other material textures

      if (object.isSkinnedMesh) {
        p_uniforms.setOptional(_gl, object, "bindMatrix");
        p_uniforms.setOptional(_gl, object, "bindMatrixInverse");

        const skeleton = object.skeleton;

        if (skeleton) {
          if (capabilities.floatVertexTextures) {
            if (skeleton.boneTexture === null) skeleton.computeBoneTexture();

            p_uniforms.setValue(
              _gl,
              "boneTexture",
              skeleton.boneTexture,
              textures
            );
            p_uniforms.setValue(
              _gl,
              "boneTextureSize",
              skeleton.boneTextureSize
            );
          } else {
            console.warn(
              "THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."
            );
          }
        }
      }

      const morphAttributes = geometry.morphAttributes;

      if (
        morphAttributes.position !== undefined ||
        morphAttributes.normal !== undefined ||
        (morphAttributes.color !== undefined && capabilities.isWebGL2 === true)
      ) {
        morphtargets.update(object, geometry, program);
      }

      if (
        refreshMaterial ||
        materialProperties.receiveShadow !== object.receiveShadow
      ) {
        materialProperties.receiveShadow = object.receiveShadow;
        p_uniforms.setValue(_gl, "receiveShadow", object.receiveShadow);
      }

      // https://github.com/mrdoob/three.js/pull/24467#issuecomment-1209031512

      if (material.isMeshGouraudMaterial && material.envMap !== null) {
        m_uniforms.envMap.value = envMap;

        m_uniforms.flipEnvMap.value =
          envMap.isCubeTexture && envMap.isRenderTargetTexture === false
            ? -1
            : 1;
      }

      if (refreshMaterial) {
        p_uniforms.setValue(
          _gl,
          "toneMappingExposure",
          _this.toneMappingExposure
        );

        if (materialProperties.needsLights) {
          // the current material requires lighting info

          // note: all lighting uniforms are always set correctly
          // they simply reference the renderer's state for their
          // values
          //
          // use the current material's .needsUpdate flags to set
          // the GL state when required

          markUniformsLightsNeedsUpdate(m_uniforms, refreshLights);
        }

        // refresh uniforms common to several materials

        if (fog && material.fog === true) {
          materials.refreshFogUniforms(m_uniforms, fog);
        }

        materials.refreshMaterialUniforms(
          m_uniforms,
          material,
          _pixelRatio,
          _height,
          _transmissionRenderTarget
        );

        WebGLUniforms.upload(
          _gl,
          materialProperties.uniformsList,
          m_uniforms,
          textures
        );
      }

      if (material.isShaderMaterial && material.uniformsNeedUpdate === true) {
        WebGLUniforms.upload(
          _gl,
          materialProperties.uniformsList,
          m_uniforms,
          textures
        );
        material.uniformsNeedUpdate = false;
      }

      if (material.isSpriteMaterial) {
        p_uniforms.setValue(_gl, "center", object.center);
      }

      // common matrices

      p_uniforms.setValue(_gl, "modelViewMatrix", object.modelViewMatrix);
      p_uniforms.setValue(_gl, "normalMatrix", object.normalMatrix);
      p_uniforms.setValue(_gl, "modelMatrix", object.matrixWorld);

      // UBOs

      if (material.isShaderMaterial || material.isRawShaderMaterial) {
        const groups = material.uniformsGroups;

        for (let i = 0, l = groups.length; i < l; i++) {
          if (capabilities.isWebGL2) {
            const group = groups[i];

            uniformsGroups.update(group, program);
            uniformsGroups.bind(group, program);
          } else {
            console.warn(
              "THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2."
            );
          }
        }
      }

      return program;
    }

    function materialNeedsLights(material) {
      return (
        material.isMeshLambertMaterial ||
        material.isMeshToonMaterial ||
        material.isMeshPhongMaterial ||
        material.isMeshStandardMaterial ||
        material.isShadowMaterial ||
        (material.isShaderMaterial && material.lights === true)
      );
    }

    this.getRenderTarget = function () {
      return _currentRenderTarget;
    };
  }
}

export { WebGLRenderer };
