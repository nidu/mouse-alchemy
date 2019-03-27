import React from 'react';
import { useEffect } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  input: {
    position: "absolute",
    right: "33%",
    width: 200,
    height: 32,
    top: 0,
    transition: "top 0.2s",
    '&:not(:focus)': {
      top: -40
    }
  }
})

class SearchField extends React.Component {
  constructor() {
    this.onRef = e => this.input = e;

    this.onKeyDown = e => {
      if (!this.props.active) return;
      
      const c = String.fromCharCode(e.which).toLowerCase()
      if (c >= 'a' && c <= 'z' || c >= 'а' && c <= 'я') {
        this.input.focus();
      } else if (e.keyCode == 27) {
        this.props.onChange("");
        this.input.blur();
      }
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  render() {
    const { value, onChange, classes } = this.props;

    const style = {};

    if (value) {
      style.top = 0;
    }

    return (
      <input
        type="text"
        value={value}
        ref={this.onRef}
        style={style}
        className={classes.input}
        onChange={e => onChange(e.target.value)}
      />
    )
  }
}

export default React.memo(withStyles(styles)(SearchField))