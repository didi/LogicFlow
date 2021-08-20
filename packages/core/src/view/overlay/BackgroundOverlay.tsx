import { h, Component } from 'preact';

export type BackgroundConfig = {
  image?: string;
  color?: string;
  repeat?: string;
  position?: string;
  size?: string;
  opacity?: number;
};

type IProps = {
  background: BackgroundConfig;
};

export default class BackgroundOverlay extends Component<IProps> {
  getAttributes() {
    const { background } = this.props;
    const {
      image = '',
      color = '',
      repeat = 'no-repeat',
      position = 'center',
      size = 'auto auto',
      opacity = 1,
    } = background;
    if (color) {
      return {
        color,
        opacity,
        image: 'none',
      };
    }
    if (image) {
      return {
        image: `url(${image})`,
        repeat,
        position,
        size,
        opacity,
      };
    }
    return {};
  }
  getShape() {
    const {
      image, color, repeat, size, position, opacity,
    } = this.getAttributes();
    const backgroundStyle = {
      backgroundImage: image,
      backgroundColor: color,
      backgroundRepeat: repeat,
      backgroundPosition: position,
      backgroundSize: size,
      opacity,
    };
    return (
      <div className="lf-background">
        <div style={backgroundStyle} className="lf-background-area" />
      </div>
    );
  }
  render() {
    return (
      this.getShape()
    );
  }
}
