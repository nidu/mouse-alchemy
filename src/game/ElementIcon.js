import React, { useContext } from "react";
import { useShaker } from '../common';

import SettingsContext from '../shared/SettingsContext';

function ElementIcon({ element, shake, size }) {
  const context = useContext(SettingsContext);
  const iconSize = size || context.elementIconSize;
  const shaker = useShaker({
    steps: 10,
    shake: shake,
    interval: 50,
    shakeOnMount: false
  });
  const shift = shaker % 2 === 0 ? shaker : -shaker;

  return (
    <img
      src={element.icon}
      alt={element.name}
      style={{
        maxWidth: iconSize,
        maxHeight: iconSize,
        transform: `translate(${shift / 2}px, ${shift / 2}px)`
      }}
    />
  );
}

export default React.memo(ElementIcon);