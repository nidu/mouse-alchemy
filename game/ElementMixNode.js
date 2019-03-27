import React from 'react';
import { useState, useEffect, pure } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'
import { makeStyles } from '@material-ui/styles';
import { withStyles } from '@material-ui/core/styles';
import posed from 'react-pose';
import classnames from 'classnames';

import SettingsContext from '../shared/SettingsContext';

import ElementIcon from './ElementIcon';
import FinalElementEffect from './FinalElementEffect';

const styles = {
  elementMixNode: {
    position: "absolute",
    transition: "transform 0.02s, opacity: 0.2s"
  },
  hidden: {
    display: "none"
  },
  unmounted: {
    opacity: 0
  }
};

const mixNodeTarget = {
  canDrop(props) {
    return true;
  },
  drop(props, monitor) {
    const item = monitor.getItem()
    const element = item.node ? item.node.element : item.element
    if (item.node == props.node) return;
    const {x, y} = item

    const offset = monitor.getClientOffset()
    const newX = offset.x - x
    const newY = offset.y - y

    props.onDrop({
      droppedElement: element,
      droppedNode: item.node,
      receivingNode: props.node,
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

const mixNodeSource = {
  beginDrag(props, monitor, component) {
    return {
      node: props.node,
      x: component.x,
      y: component.y
    }
  }
}

function collectDrag(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

class ElementMixNode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      appears: props.node.element.isFinal,
      unmounted: false
    }

    const clearTimer = () => {
      if (this.mouseDownTimer) {
        clearTimeout(this.mouseDownTimer);
        this.mouseDownTimer = undefined;
      }
    }

    this.onMouseDown = (e) => {
      this.initialMousePos = {x: e.screenX, y: e.screenY};
      this.mousePos = {x: e.screenX, y: e.screenY};
      this.mouseDownTimer = setTimeout(() => {
        clearTimer();
        if (Math.abs(this.mousePos.x - this.initialMousePos.x) < 3 &&
            Math.abs(this.mousePos.y - this.initialMousePos.y) < 3) {
          this.props.onShowEncyclopedia(this.props.node);
        }
      }, this.context.mixElementPressDurationForEncyclopedia);
    }

    this.onMouseMove = (e) => {
      this.mousePos = {x: e.screenX, y: e.screenY};
    }

    this.onMouseUp = clearTimer;
    this.onMouseOut = clearTimer;

    this.onClick = () => {
      if (this.props.node.element.isFinal) {
        this.setState({unmounted: true})
        setTimeout(() => {
          this.props.onRemoveFinal(this.props.node);
        }, 200);
      }
    }

    this.onDoubleClick = () => {
      this.props.onClone(this.props.node);
    }
  }

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true,
    });

    if (this.state.appears) {
      setTimeout(() => {
        this.setState({appears: false});
      });
    }
  }

  render() {
    const {
      node,
      connectDropTarget,
      connectDragSource,
      isDragging,
      onDrop,
      shake
    } = this.props;
    const { element, x, y } = node;

    return connectDropTarget(connectDragSource(
      <div
        style={{
          position: "absolute",
          transition: isDragging ? "transform 0.02s" : "opacity 0.2s, transform 0.2s",
          opacity: (isDragging || this.state.unmounted || this.state.appears) ? 0 : 1,
          transform: `translate(${x}px, ${y}px)` + 
            (this.state.unmounted ? `scale(1.2)` : "") +
            (this.state.appears ? `scale(0.6)` : "")
        }}
        onClick={this.onClick}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseOut={this.onMouseOut}
        onMouseMove={this.onMouseMove}
        onDoubleClick={this.onDoubleClick}>
        {element.isFinal && <FinalElementEffect />}
        <ElementIcon element={element} shake={shake} />
      </div>
    ))
  }
}
ElementMixNode.contextType = SettingsContext;

export default React.memo(
  DragSource("element", mixNodeSource, collectDrag)
    (DropTarget("element", mixNodeTarget, collectDrop)(ElementMixNode))
);