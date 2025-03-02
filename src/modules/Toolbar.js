import IconAlignLeft from 'quill/assets/icons/align-left.svg';
import IconAlignCenter from 'quill/assets/icons/align-center.svg';
import IconAlignRight from 'quill/assets/icons/align-right.svg';
import IconUndo from 'quill/assets/icons/undo.svg'
import IconRedo from 'quill/assets/icons/redo.svg'
import { BaseModule } from './BaseModule';
import Quill from 'quill';

// const Quill = window.Quill || lfQuill

const Parchment = Quill.imports.parchment;
const FloatStyle = new Parchment.Attributor.Style('text-align', 'text-align');
const MarginStyle = new Parchment.Attributor.Style('margin', 'margin');
const DisplayStyle = new Parchment.Attributor.Style('display', 'display');
const TransformStyle = new Parchment.Attributor.Style('transform', 'transform');
// const TransformOriginStyle = new Parchment.Attributor.Style('transform-origin', 'transform-origin')

export class Toolbar extends BaseModule {
	rotation = 0;

    onCreate = () => {
		// Setup Toolbar
        this.toolbar = document.createElement('div');
        Object.assign(this.toolbar.style, this.options.toolbarStyles);
        this.overlay.appendChild(this.toolbar);

        // Setup Buttons
        this._defineAlignments();
        this._addToolbarButtons();
    };

	// The toolbar and its children will be destroyed when the overlay is removed
    onDestroy = () => {};

	// Nothing to update on drag because we are are positioned relative to the overlay
    onUpdate = () => {};

    _defineAlignments = () => {
		this.rotationvalue = '';

        this.alignments = [
            {
				name: 'alignleft',
                icon: IconAlignLeft,
                apply: () => {
                    DisplayStyle.add(this.img, 'inline');
                    FloatStyle.add(this.img, 'left');
                    // MarginStyle.add(this.img, '0 1em 1em 0');
                },
                isApplied: () => FloatStyle.value(this.img) == 'left',
            },
            {
				name: 'aligncenter',
                icon: IconAlignCenter,
                apply: () => {
                    DisplayStyle.add(this.img, 'block');
                    FloatStyle.add(this.img, 'center');
                    // MarginStyle.add(this.img, 'auto');
                },
                isApplied: () => MarginStyle.value(this.img) == 'auto',
            },
            {
				name: 'alignright',
                icon: IconAlignRight,
                apply: () => {
                    DisplayStyle.add(this.img, 'inline');
                    FloatStyle.add(this.img, 'right');
                    // MarginStyle.add(this.img, '0 0 1em 1em');
                },
                isApplied: () => FloatStyle.value(this.img) == 'right',
			},
			{
				name: 'rotate-left',
				icon: IconUndo,
                apply: () => {
					// this.rotationvalue = this._setRotation('left');
                    // TransformStyle.add(this.img, this.rotationvalue);
                    // console.log(TransformStyle.value(this.img))
					// this._fixRotationOverlap(this.rotationvalue, this.img)
					let canvas = document.createElement('canvas')
					let context = canvas.getContext('2d')
					canvas.width = this.img.width
					canvas.height = this.img.height
					context.rotate(-90 * Math.PI / 180)
					context.translate(-canvas.width, 0)
					context.drawImage(this.img, 0, 0)
					let rotatedImg = canvas.toDataURL()
					this.img.src = rotatedImg	
					this.requestUpdate()			
                },
                isApplied: () => { },
			},
			{
				name: 'rotate-right',
                icon: IconRedo,
                apply: () => {
					// this.rotationvalue = this._setRotation('right');
                    // TransformStyle.add(this.img, this.rotationvalue);
					// this._fixRotationOverlap(this.rotationvalue, this.img)
					let canvas = document.createElement('canvas')
					let context = canvas.getContext('2d')
					canvas.width = this.img.width
					canvas.height = this.img.height
					context.rotate(90 * Math.PI / 180)
					context.translate(0, -canvas.width)
					context.drawImage(this.img, 0, 0)
					let rotatedImg = canvas.toDataURL()
					this.img.src = rotatedImg	
					this.requestUpdate()
                },
                isApplied: () => { },
			},

        ];
	};
	
	_fixRotationOverlap = (rotationvalue, img) => {
		if (rotationvalue.indexOf('90') !== -1) {
			let overlapFix = (img.width - img.height) / 2

			if (img.width < img.height) {
				let horizontalOverlapFix = (img.height - img.width) / 2
				MarginStyle.add(img, `${overlapFix}px ${horizontalOverlapFix}px`)
			} else {
				MarginStyle.add(img, `${overlapFix}px auto`)
			}
		} else {
			MarginStyle.add(img, '0')
		}
	}

    _addToolbarButtons = () => {
		const buttons = [];
		this.alignments.forEach((alignment, idx) => {
			const button = document.createElement('span');
			button.setAttribute('title', alignment.name);
			buttons.push(button);
			button.innerHTML = alignment.icon;
			button.addEventListener('click', () => {
					// deselect all buttons
				buttons.forEach(button => button.style.filter = '');
				if (alignment.isApplied()) {
						// If applied, unapply
					FloatStyle.remove(this.img);
					MarginStyle.remove(this.img);
					DisplayStyle.remove(this.img);
				}				else {
						// otherwise, select button and apply
					this._selectButton(button);
					alignment.apply();
				}
					// image may change position; redraw drag handles
				this.requestUpdate();
			});
			Object.assign(button.style, this.options.toolbarButtonStyles);
			if (idx > 0) {
				button.style.borderLeftWidth = '0';
			}
			Object.assign(button.children[0].style, this.options.toolbarButtonSvgStyles);
			if (alignment.isApplied()) {
					// select button if previously applied
				this._selectButton(button);
			}
			this.toolbar.appendChild(button);
		});
    };

    _selectButton = (button) => {
		if ((button.title != 'rotate-left') && (button.title != 'rotate-right')) {
			button.style.filter = 'invert(20%)';
		}
	};

	_setRotation(direction) {
		if (this.rotation == 0 && direction == 'left') {
			this.rotation = -90;
		} else if (this.rotation == -90 && direction == 'left') {
			this.rotation = 180;
		} else if (this.rotation == 180 && direction == 'left') {
			this.rotation = 90;
		} else if (this.rotation == 90 && direction == 'left') {
			this.rotation = 0;
		} else if (this.rotation == 0 && direction == 'right') {
			this.rotation = 90;
		} else if (this.rotation == 90 && direction == 'right') {
			this.rotation = 180;
		} else if (this.rotation == 180 && direction == 'right') {
			this.rotation = -90;
		} else if (this.rotation == -90 && direction == 'right') {
			this.rotation = 0;
		}

		return 'rotate(' + this.rotation + 'deg)';
	}

}
