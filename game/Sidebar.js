import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { makeStyles } from '@material-ui/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import ElementListItem from './ElementListItem';

const useStyles = makeStyles(theme => ({
  sidebar: {
    height: "100%",
    overflow: "auto",
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[5]
  }
}));

const target = {
  canDrop(props) {
    return true;
  },
  drop(props, monitor) {
    const node = monitor.getItem().node
    if (!node) return

    props.onDrop(node);
  }
}

function collectDrop(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

function Sidebar({ 
  elements, 
  connectDropTarget,
  onDrop,
  lastBadMixInfo,
  onHideElement
}) {
  const classes = useStyles();

  const listItems = elements.map(({element, canBeHidden}) => {
    return (
      <ListItem key={element.id}>
        <ElementListItem 
          key={element.id} 
          element={element} 
          canBeHidden={canBeHidden}
          onRemove={canBeHidden ? () => {
            onHideElement(element);
          } : undefined}
        />
      </ListItem>
    )
  });

  return connectDropTarget(
    <div className={classes.sidebar}>
      <List>
        {listItems}
      </List>
    </div>
  )
}

export default React.memo(DropTarget("element", target, collectDrop)(Sidebar))