!function(t){var e={};function n(o){if(e[o])return e[o].exports;var i=e[o]={i:o,l:!1,exports:{}};return t[o].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)n.d(o,i,function(e){return t[e]}.bind(null,i));return o},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){const o=n(1),i=o.defineNode({category:"Camera",name:"Web Camera",docs:"https://docs.noodl.net/modules/webcamera/webcamera-node",initialize(){this.inputs.frontFacing=!0},signals:{startStream:{displayName:"Start Stream",signal:function(){this.startStream()}},stopStream:{displayName:"Stop Stream",signal:function(){this.stopStream()}}},changed:{frontFacing:function(t){this.stopStream(),this.startStream()},frameRate:function(t){this.stopStream(),this.startStream()}},inputs:{frontFacing:{type:"boolean",displayName:"Front Facing",default:!0},frameRate:{displayName:"Frame Rate",type:"number"}},outputs:{stream:{type:"mediastream",displayName:"Media Stream"},streamStarted:{displayName:"Media Stream Started",type:"signal"},streamStopped:{displayName:"Media Stream Stopped",type:"signal"}},methods:{startStream(){this.isStreaming=!0;const t={video:{facingMode:this.inputs.frontFacing?"front":"environment"}};void 0!==this.inputs.frameRate&&(t.video.frameRate={ideal:this.inputs.frameRate}),navigator.mediaDevices.getUserMedia(t).then(t=>{!1!==this.isStreaming&&(this.setOutputs({stream:t}),this.sendSignalOnOutput("streamStarted"))}).catch(t=>{console.log("Web Camera stream error",t),this.isStreaming=!1})},stopStream(){if(!this.isStreaming)return;this.isStreaming=!1;const t=this.outputs.stream,e=t.getTracks();for(const n of e)n.stop(),t.removeTrack(n);this.setOutputs({stream:null}),this.sendSignalOnOutput("streamStopped")}}});o.defineModule({nodes:[i],setup(){}})},function(t,e){const n={purple:"component",green:"data",default:"default",grey:"default"};Noodl.defineNode=function(t){const e={};for(var o in e.name=t.name,e.displayNodeName=t.displayName,e.usePortAsLabel=t.useInputAsLabel,e.color=n[t.color||"default"],e.category=t.category||"Modules",e.getInspectInfo=t.getInspectInfo,e.docs=t.docs,e.initialize=function(){this.inputs={};var e=this.outputs={},n=this;this.setOutputs=function(t){for(var o in t)e[o]=t[o],n.flagOutputDirty(o)},this.clearWarnings=function(){this.context.editorConnection&&this.nodeScope&&this.nodeScope.componentOwner&&this.context.editorConnection.clearWarnings(this.nodeScope.componentOwner.name,this.id)}.bind(this),this.sendWarning=function(t,e){this.context.editorConnection&&this.nodeScope&&this.nodeScope.componentOwner&&this.context.editorConnection.sendWarning(this.nodeScope.componentOwner.name,this.id,t,{message:e})}.bind(this),"function"==typeof t.initialize&&t.initialize.apply(this)},e.inputs={},e.outputs={},t.inputs)e.inputs[o]={type:"object"==typeof t.inputs[o]?t.inputs[o].type:t.inputs[o],displayName:"object"==typeof t.inputs[o]?t.inputs[o].displayName:void 0,group:"object"==typeof t.inputs[o]?t.inputs[o].group:void 0,default:"object"==typeof t.inputs[o]?t.inputs[o].default:void 0,set:function(){const e=o;return function(n){this.inputs[e]=n,t.changed&&"function"==typeof t.changed[e]&&t.changed[e].apply(this,[n])}}()};for(var o in t.signals)e.inputs[o]={type:"signal",displayName:"object"==typeof t.signals[o]?t.signals[o].displayName:void 0,group:"object"==typeof t.signals[o]?t.signals[o].group:void 0,valueChangedToTrue:function(){const e=o;return function(){const n="object"==typeof t.signals[e]?t.signals[e].signal:t.signals[e];"function"==typeof n&&this.scheduleAfterInputsHaveUpdated(()=>{n.apply(this)})}}()};for(var o in t.outputs)"signal"===t.outputs[o]?e.outputs[o]={type:"signal"}:e.outputs[o]={type:"object"==typeof t.outputs[o]?t.outputs[o].type:t.outputs[o],displayName:"object"==typeof t.outputs[o]?t.outputs[o].displayName:void 0,group:"object"==typeof t.outputs[o]?t.outputs[o].group:void 0,getter:function(){const t=o;return function(){return this.outputs[t]}}()};for(var o in e.methods=e.prototypeExtensions={},t.methods)e.prototypeExtensions[o]=t.methods[o];return e.methods.onNodeDeleted&&(e.methods._onNodeDeleted=function(){this.__proto__.__proto__._onNodeDeleted.call(this),e.methods.onNodeDeleted.value.call(this)}),{node:e,setup:t.setup}},Noodl.defineCollectionNode=function(t){const e={name:t.name,category:t.category,color:"data",inputs:t.inputs,outputs:Object.assign({Items:"array","Fetch Started":"signal","Fetch Completed":"signal"},t.outputs||{}),signals:Object.assign({Fetch:function(){var e=this;this.sendSignalOnOutput("Fetch Started");var n=t.fetch.call(this,(function(){e.sendSignalOnOutput("Fetch Completed")}));this.setOutputs({Items:n})}},t.signals||{})};return Noodl.defineNode(e)},Noodl.defineModelNode=function(t){const e={name:t.name,category:t.category,color:"data",inputs:{Id:"string"},outputs:{Fetched:"signal"},changed:{Id:function(t){this._object&&this._changeListener&&this._object.off("change",this._changeListener),this._object=Noodl.Object.get(t),this._changeListener=(t,e)=>{const n={};n[t]=e,this.setOutputs(n)},this._object.on("change",this._changeListener),this.setOutputs(this._object.data),this.sendSignalOnOutput("Fetched")}},initialize:function(){}};for(var n in t.properties)e.inputs[n]=t.properties[n],e.outputs[n]=t.properties[n],e.changed[n]=function(){const t=n;return function(e){this._object&&this._object.set(t,e)}}();return Noodl.defineNode(e)},Noodl.defineReactNode=function(t){var e=Noodl.defineNode(t);return e.node.getReactComponent=t.getReactComponent,e.node.inputProps=t.inputProps,e.node.inputCss=t.inputCss,e.node.outputProps=t.outputProps,e.node.setup=t.setup,e.node.frame=t.frame,e.node},t.exports=Noodl}]);
//# sourceMappingURL=index.js.map