import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import {makeStyles} from "@material-ui/styles";

import Loader from '../game/Loader';
import {db} from '../firebase';

import TextInputOnEnter from '../shared/TextInputOnEnter';

const useStyles = makeStyles(theme => ({
  container: {
    maxWidth: 600
  }
}));

export default function GlobalSettings() {
  const [settings, setSettings] = useState();
  const [loading, setLoading] = useState(true);
  const classes = useStyles();

  const docRef = db.collection("settings")
      .doc("default");

  useEffect(() => {
    docRef.get()
      .then(doc => {
        console.log("Got settings", doc.data())
        setSettings(doc.data());
        setLoading(false);
      })
  }, []);

  const handleChangeNumber = name => value => {
    value = Number(value);
    setSettings({...settings, [name]: value});
    docRef.update({[name]: value});
  }

  if (loading) {
    return <Loader message="Загрузка..." />;
  }

  return (
    <div className={classes.container}>
      <Typography variant="h2">
        Настройки
      </Typography>
      <Typography>
        <Link to="/admin">Список шаблонов</Link>
        <br/>
        <Link to="/admin/games">Список игр</Link>
      </Typography>
      <TextInputOnEnter
        id="mixElementPressDurationForEncyclopedia"
        label="Задержка перед показом энциклопедии при нажатии на элементе"
        helperText="миллисекунды"
        value={settings.mixElementPressDurationForEncyclopedia}
        onChange={handleChangeNumber('mixElementPressDurationForEncyclopedia')}
        margin="normal"
        fullWidth
        error={typeof Number(settings.mixElementPressDurationForEncyclopedia) != "number"}
      />
      <br/>
      <TextInputOnEnter
        id="elementIconSize"
        label="Размер иконки"
        helperText="пиксели"
        value={settings.elementIconSize}
        onChange={handleChangeNumber('elementIconSize')}
        margin="normal"
        fullWidth
        error={typeof Number(settings.elementIconSize) != "number"}
      />
      <br />
      <TextInputOnEnter
        id="cloneElementShiftX"
        label="Сдвиг скопированного элемента вправо"
        helperText="пиксели"
        value={settings.cloneElementShiftX}
        onChange={handleChangeNumber('cloneElementShiftX')}
        margin="normal"
        fullWidth
        error={typeof Number(settings.cloneElementShiftX) != "number"}
      />
      <br />
      <TextInputOnEnter
        id="cloneElementShiftY"
        label="Сдвиг скопированного элемента вниз"
        helperText="пиксели"
        value={settings.cloneElementShiftY}
        onChange={handleChangeNumber('cloneElementShiftY')}
        margin="normal"
        fullWidth
        error={typeof Number(settings.cloneElementShiftY) != "number"}
      />
      <br />
      <TextInputOnEnter
        id="elementSoulFadeDuration"
        label="Время исчезновения иконки при получении уже найденного элемента"
        helperText="пиксели"
        value={settings.elementSoulFadeDuration}
        onChange={handleChangeNumber('elementSoulFadeDuration')}
        margin="normal"
        fullWidth
        error={typeof Number(settings.elementSoulFadeDuration) != "number"}
      />
      <br />
      <TextInputOnEnter
        id="elementSoulOffsetX"
        label="Сдвиг иконки вправо при получении уже найденного элемента"
        helperText="пиксели"
        value={settings.elementSoulOffsetX}
        onChange={handleChangeNumber('elementSoulOffsetX')}
        margin="normal"
        fullWidth
        error={typeof Number(settings.elementSoulOffsetX) != "number"}
      />
      <br />
      <TextInputOnEnter
        id="elementSoulOffsetY"
        label="Сдвиг иконки вниз при получении уже найденного элемента"
        helperText="пиксели"
        value={settings.elementSoulOffsetY}
        onChange={handleChangeNumber('elementSoulOffsetY')}
        margin="normal"
        fullWidth
        error={typeof Number(settings.elementSoulOffsetY) != "number"}
      />
      <br />
      <TextInputOnEnter
        id="audio1Volume"
        label="Громкость основной мелодии"
        helperText="0-1"
        value={settings.audio1Volume}
        onChange={handleChangeNumber('audio1Volume')}
        margin="normal"
        fullWidth
        error={typeof Number(settings.audio1Volume) != "number" || settings.audio1Volume > 1}
      />
      <br />
      <TextInputOnEnter
        id="audio2Volume"
        label="Громкость скрытой мелодии"
        helperText="0-1"
        value={settings.audio2Volume}
        onChange={handleChangeNumber('audio2Volume')}
        margin="normal"
        fullWidth
        error={typeof Number(settings.audio2Volume) != "number" || settings.audio2Volume > 1}
      />
      <br />
      <TextInputOnEnter
        id="showCatProbablity"
        label="Вероятность появления кота-музыканта раз в 10 секунд"
        helperText="0-1"
        value={settings.showCatProbablity}
        onChange={handleChangeNumber('showCatProbablity')}
        margin="normal"
        fullWidth
        error={typeof Number(settings.showCatProbablity) != "number" || settings.audio2Volume > 1}
      />
    </div>
  )
}