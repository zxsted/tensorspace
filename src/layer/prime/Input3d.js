import { Layer } from "./Layer";
import { fmCenterGenerator } from "../../utils/FmCenterGenerator";
import { InputMap3d } from "../../elements/InputMap3d";
import { ChannelMap } from "../../elements/ChannelMap";
import { colorUtils } from "../../utils/ColorUtils";
import { RGBTweenFactory } from "../../animation/RGBChannelTween";
import { ModelInitWidth } from "../../utils/Constant";

function Input3d(config) {

	Layer.call(this, config);

	this.shape = config.shape;
	this.width = config.shape[0];
	this.height = config.shape[1];
	this.depth = 3;
	this.neuralNum = config.shape[0] * config.shape[1];
	this.outputShape = config.shape;

	this.fmCenters = [];
	this.closeFmCenters = [];
	this.openFmCenters = fmCenterGenerator.getFmCenters("line", 3, this.width, this.height);
	this.leftMostCenter = this.openFmCenters[0];

	for (let i = 0; i < 3; i++) {
		this.closeFmCenters.push({
			x: 0,
			y: 0,
			z: 0
		});
	}

	this.separateTopPos = {
		x: 0,
		y: 20,
		z: 0
	};

	this.separateBottomPos = {
		x: 0,
		y: -20,
		z: 0
	};

	this.isOpen = false;

	this.aggregationHandler = undefined;
	this.segregationHandlers = [];

	this.actualWidth = ModelInitWidth;
	this.actualHeight = this.actualWidth / this.width * this.height;
	this.realVirtualRatio = this.actualWidth / this.width;

	this.layerType = "input3d";

}

Input3d.prototype = Object.assign(Object.create(Layer.prototype), {

	init: function(center) {

		this.center = center;

		this.neuralGroup = new THREE.Group();
		this.neuralGroup.position.set(this.center.x, this.center.y, this.center.z);

		this.initAggregationElement();

		this.scene.add(this.neuralGroup);

	},

	assemble: function(layerIndex, modelConfig) {

		console.log("Assemble input3d layer");

		this.layerIndex = layerIndex;

		if (this.color !== undefined) {
			this.color = modelConfig.color.input;
		}

	},

	openLayer: function() {

		if (!this.isOpen) {
			RGBTweenFactory.separate(this);
		}

	},

	closeLayer: function() {

		if (this.isOpen) {
			RGBTweenFactory.aggregate(this);
		}

	},

	initAggregationElement: function() {

		let aggregationHandler = new InputMap3d(this.width,
			this.height,
			this.actualWidth,
			this.actualHeight,
			{
				x: 0,
				y: 0,
				z: 0
			},
			this.color
		);

		aggregationHandler.setLayerIndex(this.layerIndex);

		this.aggregationHandler = aggregationHandler;
		this.neuralGroup.add(this.aggregationHandler.getElement());

		if (this.neuralValue !== undefined) {
			this.updateAggregationVis();
		}

	},

	disposeAggregationElement: function() {

		this.neuralGroup.remove(this.aggregationHandler.getElement());
		this.aggregationHandler = undefined;

	},

	initSegregationElements: function() {

		let rChannel = new ChannelMap(
			this.width,
			this.height,
			this.actualWidth,
			this.actualHeight,
			this.closeFmCenters[0],
			this.color,
			"R"
		);
		let gChannel = new ChannelMap(
			this.width,
			this.height,
			this.actualWidth,
			this.actualHeight,
			this.closeFmCenters[1],
			this.color,
			"G"
		);
		let bChannel = new ChannelMap(
			this.width,
			this.height,
			this.actualWidth,
			this.actualHeight,
			this.closeFmCenters[2],
			this.color,
			"B"
		);

		this.segregationHandlers.push(rChannel);
		this.segregationHandlers.push(gChannel);
		this.segregationHandlers.push(bChannel);

		if (this.neuralValue !== undefined) {

			this.updateSegregationVis();
		}

		this.neuralGroup.add(rChannel.getElement());
		this.neuralGroup.add(gChannel.getElement());
		this.neuralGroup.add(bChannel.getElement());

	},

	disposeSegregationElements: function() {

		for (let i = 0; i < this.segregationHandlers.length; i++) {
			this.neuralGroup.remove(this.segregationHandlers[i].getElement());
		}
		this.segregationHandlers = [];

	},

	updateValue: function(value) {

		this.neuralValue = value;

		if (this.isOpen) {

			this.updateSegregationVis();

		} else {

			this.updateAggregationVis();

		}

	},

	updateAggregationVis: function() {

		let colors = colorUtils.getAdjustValues(this.neuralValue);
		this.aggregationHandler.updateVis(colors);
	},

	updateSegregationVis: function() {

		let colors = colorUtils.getAdjustValues(this.neuralValue);

		let rVal = [];
		let gVal = [];
		let bVal = [];

		for (let i = 0; i < colors.length; i++) {

			if (i % 3 === 0) {
				rVal.push(colors[i]);
			} else if (i % 3 === 1) {
				gVal.push(colors[i]);
			} else {
				bVal.push(colors[i]);
			}

		}

		this.segregationHandlers[0].updateVis(rVal);
		this.segregationHandlers[1].updateVis(gVal);
		this.segregationHandlers[2].updateVis(bVal);

	}
});

export { Input3d };