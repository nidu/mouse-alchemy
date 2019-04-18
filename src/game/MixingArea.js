import React from 'react';
import { DropTarget } from 'react-dnd';
import { makeStyles } from '@material-ui/styles';

import ElementMixNode from './ElementMixNode';
import ElementSoul from './ElementSoul';

const useStyles = makeStyles(theme => ({
  mixingArea: {
    background: theme.game.background.default,
    color: theme.game.text.default,
    height: "100%",
    overflow: "hidden"
  },
  elementMixNode: {
    position: "absolute"
  }
}))

function MixingAreaInner({
  connectDropTarget,
  elements,
  lastRepeatedElement,
  lastBadMixInfo,
  onShowEncyclopedia,
  onDrop,
  onRemoveFinal,
  onClone
}) {
  const classes = useStyles()

  const elementNodes = elements.map((node) => {
    const shake = lastBadMixInfo &&
      (lastBadMixInfo.id1 === node.id || lastBadMixInfo.id2 === node.id) &&
      lastBadMixInfo.date;

    return (
      <ElementMixNode
        key={node.id}
        node={node}
        onDrop={onDrop}
        onClone={onClone}
        shake={shake}
        onShowEncyclopedia={onShowEncyclopedia}
        onRemoveFinal={onRemoveFinal}
      />
    )
  });

  return connectDropTarget(
    <div className={classes.mixingArea}>
      {elementNodes}
      <ElementSoul
        lastRepeatedElement={lastRepeatedElement}
      />
    </div>
  )
}

const mixingAreaTarget = {
  canDrop() {
    return true;
  },
  drop(props, monitor) {
    if (monitor.didDrop()) return;

    const { element, node, x, y } = monitor.getItem()
    let newX, newY
    if (element) {
      const offset = monitor.getClientOffset()
      newX = offset.x - x
      newY = offset.y - y
    } else {
      const diff = monitor.getDifferenceFromInitialOffset()
      newX = node.x + diff.x
      newY = node.y + diff.y
    }
    props.onAdd({
      element,
      node,
      x: newX,
      y: newY
    });
  }
}

function collectDrop(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

export default DropTarget("element", mixingAreaTarget, collectDrop)(MixingAreaInner);