/**
 * @author syt123450 / https://github.com/syt123450
 */

import { FmCenterGenerator } from "../../utils/FmCenterGenerator";
import { NativeLayer3d } from "../abstract/NativeLayer3d";

function UpSampling2d( config ) {

	NativeLayer3d.call( this, config );

	this.size = undefined;
	this.widthSize = undefined;
	this.heightSize = undefined;

	this.isShapePredefined = false;

	this.loadLayerConfig( config );

	this.layerType = "prime upSampling2d";

}

UpSampling2d.prototype = Object.assign( Object.create( NativeLayer3d.prototype ), {

	loadLayerConfig: function( layerConfig ) {

		if ( layerConfig !== undefined ) {

			if ( layerConfig.size !== undefined ) {

				this.size = layerConfig.size;
				this.widthSize = layerConfig.size[ 0 ];
				this.heightSize = layerConfig.size[ 1 ];

			} else {

				console.error( "\"size\" property is required for UpSampling layer" );

			}

			if ( layerConfig.shape !== undefined ) {

				this.isShapePredefined = true;
				this.fmShape = layerConfig.shape;
				this.width = layerConfig.shape[ 0 ];
				this.height = layerConfig.shape[ 1 ];

			}

		}

	},

	loadModelConfig: function( modelConfig ) {

		this.loadBasicModelConfig( modelConfig );

		if ( this.color === undefined ) {

			this.color = modelConfig.color.upSampling2d;

		}

		if ( this.layerShape === undefined ) {

			this.layerShape = modelConfig.layerShape;

		}

		if ( this.aggregationStrategy === undefined ) {

			this.aggregationStrategy = modelConfig.aggregationStrategy;

		}

	},

	assemble: function( layerIndex ) {

		this.layerIndex = layerIndex;

		this.depth = this.lastLayer.depth;

		if ( !this.isShapePredefined ) {

			this.inputShape = this.lastLayer.outputShape;
			this.width = this.lastLayer.width * this.widthSize;
			this.height = this.lastLayer.height * this.heightSize;

		}

		this.outputShape = [ this.width, this.height, this.depth ];

		for ( let i = 0; i < this.depth; i++ ) {

			let center = {

				x: 0,
				y: 0,
				z: 0

			};

			this.closeFmCenters.push( center );

		}

		this.unitLength = this.lastLayer.unitLength;
		this.actualWidth = this.width * this.unitLength;
		this.actualHeight = this.height * this.unitLength;

		this.openFmCenters = FmCenterGenerator.getFmCenters( this.layerShape, this.depth, this.actualWidth, this.actualHeight );

	},

	getRelativeElements: function( selectedElement ) {

		let relativeElements = [];

		if ( selectedElement.elementType === "aggregationElement" ) {

			let request = {

				all: true

			};

			relativeElements = this.lastLayer.provideRelativeElements( request ).elementList;


		} else if ( selectedElement.elementType === "featureMap" ) {

			let fmIndex = selectedElement.fmIndex;

			let request = {

				index: fmIndex

			};

			relativeElements = this.lastLayer.provideRelativeElements( request ).elementList;

		}

		return relativeElements;

	}

} );

export { UpSampling2d }