import React, {useState, useEffect} from "react";
import TextField from '@material-ui/core/TextField';

export default function TextInputOnEnter({ value, onChange, ...props }) {
  const [innerValue, setInnerValue] = useState(value);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const onKeyUp = event => {
    if (event.keyCode == 13) onChange(event.target.value);
    else if (event.keyCode == 27) setInnerValue(value);
  };

  return (
    <TextField
      {...props}
      value={innerValue}
      onChange={e => setInnerValue(e.target.value)}
      inputProps={{
        onBlur: e => onChange(e.target.value),
        onKeyUp
      }}
    />
  )
}