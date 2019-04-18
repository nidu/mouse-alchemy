import * as React from 'react'
import { DragLayer } from 'react-dnd'
import ElementIcon from './ElementIcon'

const layerStyles = {
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
}

function getItemStyles(props) {
  const { initialOffset, currentOffset } = props
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    }
  }

  let { x, y } = currentOffset

  const transform = `translate(${x}px, ${y}px)`
  return {
    width: 64,
    height: 64,
    transform,
    WebkitTransform: transform,
  }
}

const CustomDragLayer = props => {
  const { item, isDragging } = props
  const element = item && ((item.node && item.node.element) || item.element);
  if (!element || !isDragging) return null;

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(props)}>
        <ElementIcon element={element} />
      </div>
    </div>
  )
}

export default DragLayer(monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging(),
}))(CustomDragLayer)