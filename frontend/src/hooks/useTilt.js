import { useMemo, useState } from 'react';

export function useTilt(options = {}) {
  const { max = 8, scale = 1.01 } = options;
  const [transform, setTransform] = useState(
    'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
  );

  return useMemo(
    () => ({
      onMouseMove: (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const horizontal = (event.clientX - rect.left) / rect.width - 0.5;
        const vertical = (event.clientY - rect.top) / rect.height - 0.5;
        const rotateY = horizontal * max * 2;
        const rotateX = vertical * -max * 2;
        setTransform(
          `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
            2,
          )}deg) translateY(-4px) scale(${scale})`,
        );
      },
      onMouseLeave: () =>
        setTransform('perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)'),
      style: {
        transform,
        transformStyle: 'preserve-3d',
        transition: 'transform 180ms ease',
      },
    }),
    [max, scale, transform],
  );
}
