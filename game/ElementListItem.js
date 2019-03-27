import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'
import { makeStyles } from '@material-ui/styles';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ElementIcon from './ElementIcon';

const useStyles = makeStyles(theme => ({
  name: {
    marginLeft: 10
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    userSelect: "none"
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
  constructor() {
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
    const { classes } = this.props;
    const { element, shake, connectDragSource } = this.props;

    return connectDragSource(
      <div onMouseDown={this.onMouseDown}>
        <ElementIcon element={element} shake={shake} />
      </div>
    );
  }
}

const Icon = DragSource("element", elementListItemSource, collectDrag)(IconInner)

function ElementListItem({ element, className, x, y, shake }) {
  const classes = useStyles();

  return (
    <div className={classes.listItem}>
      <Icon
        element={element}
        classes={classes}
        shake={shake}
      />
      <Typography className={classes.name}>
        {element.name}
      </Typography>
    </div>
  )
}

export default ElementListItem;