import { AnimationHandlerResponse, AnimationHandler } from 'react-responsive-carousel/lib/ts/components/Carousel/types';

const slideAnimationHandler: AnimationHandler = (props, state): AnimationHandlerResponse => {
  const transitionTime = props.transitionTime + 'ms';
  const transitionTimingFunction = 'ease-in-out';

  let slideStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'block',
    zIndex: -2,
    minHeight: '100%',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    transform: 'rotateY(45deg)',
    backfaceVisibility: 'hidden',
    transitionTimingFunction: transitionTimingFunction,
    msTransitionTimingFunction: transitionTimingFunction,
    MozTransitionTimingFunction: transitionTimingFunction,
    WebkitTransitionTimingFunction: transitionTimingFunction,
    OTransitionTimingFunction: transitionTimingFunction,
  };

  if (!state.swiping) {
    slideStyle = {
      ...slideStyle,
      WebkitTransitionDuration: transitionTime,
      MozTransitionDuration: transitionTime,
      OTransitionDuration: transitionTime,
      transitionDuration: transitionTime,
      msTransitionDuration: transitionTime,
    };
  }

  return {
    slideStyle,
    selectedStyle: {
      ...slideStyle,
      opacity: 1,
      position: 'relative',
      transform: 'rotateY(0deg)',
      zIndex: 10,
    },
    prevStyle: {
      ...slideStyle,
      transform: 'rotateY(-45deg)',
      zIndex: 5,
    },
    nextStyle: {
      ...slideStyle,
      transform: 'rotateY(45deg)',
      zIndex: 5,
    },
  };
};

export default slideAnimationHandler;
