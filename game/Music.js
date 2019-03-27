import React, {useState, useEffect, useContext} from 'react';

import firebase from "../firebase";

import SettingsContext from '../shared/SettingsContext';

export default function Music({active, alternate}) {
  const [files, setFiles] = useState();
  const [mounted, setMounted] = useState(false);
  const {audio1Volume, audio2Volume} = useContext(SettingsContext);

  const audio1 = React.createRef();
  const audio2 = React.createRef();
  
  useEffect(() => {
    const storage = firebase.storage();
    Promise.all([
        "mouse2.mp3",
        "mouse1.mp3"
      ].map(name => storage.ref(name).getDownloadURL()))
      .then(urls => {
        setFiles(urls);
      });
  }, []);

  useEffect(() => {
    if (!audio1.current || !audio2.current) return;

    const ref = alternate ? audio2.current : audio1.current;

    if (active) {
      ref.play();
    } else {
      ref.pause();
    }
  }, [files, active]);

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }

    const [ref1, ref2] = alternate ? 
      [audio1.current, audio2.current] : 
      [audio2.current, audio1.current];
    ref2.currentTime = ref1.currentTime;
    if (active) {
      ref2.play();
      ref1.pause();
    }
  }, [alternate]);

  if (!files) {
    return null;
  } else {
    return (
      <div>
        <audio loop preload="auto" ref={e => {
          if (e) e.volume = audio1Volume
          audio1.current = e
        }}>
          <source src={files[0]} type="audio/mp3" />
        </audio>
        <audio loop preload="auto" ref={e => {
          if (e) e.volume = audio2Volume
          audio2.current = e
        }}>
          <source src={files[1]} type="audio/mp3" />
        </audio>
      </div>
    );
  }
}