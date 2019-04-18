import React, { useState } from 'react';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';

import cx from "classnames";

import ElementIcon from './ElementIcon';
import FinalElementEffect from './FinalElementEffect';

const useStyles = makeStyles(theme => ({
  name: {
    marginLeft: 10,
    color: theme.game.text.primary
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    userSelect: "none",
    transition: "opacity 0.5s, transform 0.5s"
  },
  removing: {
    transform: "scale(1.1)",
    opacity: 0
  }
}));

const elementListItemSource = {
  beginDrag(props, monitor, component) {
    const { x, y } = component;
    return {
      element: props.element,
      x: x,
      y: y
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

class IconInner extends React.Component {
  constructor(props) {
    super(props);
    this.onMouseDown = (event) => {
      const bbox = event.target.getBoundingClientRect();
      this.x = Math.round(event.clientX - bbox.x);
      this.y = Math.round(event.clientY - bbox.y);
    }
  }

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true,
    });
  }

  render() {
    const { element, shake, connectDragSource } = this.props;

    return connectDragSource(
      <div onMouseDown={this.onMouseDown}>
        <ElementIcon element={element} shake={shake} />
      </div>
    );
  }
}

const Icon = DragSource("element", elementListItemSource, collectDrag)(IconInner)

function ElementListItem({ element, className, x, y, shake, onRemove, canBeHidden }) {
  const classes = useStyles();

  const [removing, setRemoving] = useState(false);

  const onClick = canBeHidden ? () => {
    setRemoving(true);
    setTimeout(onRemove, 500);
  } : undefined;

  return (
    <div className={cx(classes.listItem, {
      [classes.removing]: removing
    })} onClick={onClick}>
      {canBeHidden && <FinalElementEffect />}
      <Icon
        element={element}
        classes={classes}
        shake={shake}
      />
      <Typography variant="h4" className={classes.name}>
        {element.name}
      </Typography>
    </div>
  )
}

export default ElementListItem;