"""Rebuild original audio. Developer tool only; shipped OGG files need no Python.

Requires numpy, scipy, piper-tts, ffmpeg and the CC BY 4.0 French SIWIS Piper
model. Pass the local .onnx path; no model or TTS runtime is shipped to browsers.
"""
import argparse, json, subprocess, tempfile, wave
from pathlib import Path
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/audio'
SR = 22050
rng = np.random.default_rng(456)
manifest = {}

def save(name, samples, category='effects', description='Original sound design'):
    samples = np.asarray(samples)
    peak = max(.001, np.abs(samples).max())
    samples = samples / max(1, peak/0.88)
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp)/'source.wav'
        wavfile.write(wav, SR, (samples*32767).astype(np.int16))
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-c:a','libvorbis','-q:a','4',str(OUT/(name+'.ogg'))],check=True)
    manifest[name] = dict(file=name+'.ogg',duration=round(len(samples)/SR,4),category=category,description=description)

def noise(n): return rng.normal(0,.32,n)
def t(duration): return np.arange(int(SR*duration))/SR
def filtered(x, freq, kind='lowpass'):
    return signal.sosfilt(signal.butter(3,freq,kind,fs=SR,output='sos'),x)
def echo(x, delay=.12, strength=.23):
    out=np.zeros(len(x)+int(SR*.6));out[:len(x)]=x
    for i in range(1,5):
        offset=int(SR*delay*i);end=min(len(out),offset+len(x));out[offset:end]+=x[:end-offset]*strength**i
    return out

def effects():
    v=t(1.1);n=noise(len(v))
    shot=filtered(n,2800)*np.exp(-v*38)+.55*np.sin(2*np.pi*(74*v+100*v*v))*np.exp(-v*15)
    shot+=filtered(noise(len(v)),[450,5800],'bandpass')*.55*np.exp(-v*17)
    save('shot',echo(shot,.075,.36),description='Layered blast, low-pressure thump and courtyard reflections; no recording of a weapon')
    v=t(.5);save('impact',filtered(noise(len(v)),900)*np.exp(-v*20)+np.sin(2*np.pi*85*v)*np.exp(-v*23))
    v=t(.8);save('body',filtered(noise(len(v)),260)*np.exp(-v*9)+np.sin(2*np.pi*58*v)*np.exp(-v*12))
    for name,freq in [('sand',1400),('stone',3300),('metal',5600)]:
        v=t(.3);s=filtered(noise(len(v)),freq)*np.exp(-v*22)
        if name=='metal': s+=.16*np.sin(2*np.pi*1740*v)*np.exp(-v*35)
        save('step-'+name,s,description='Original layered '+name+' footstep')
    v=t(1.5);save('glass',echo(filtered(noise(len(v)),[1800,9500],'bandpass')*np.exp(-v*7)+sum(.13*np.sin(2*np.pi*f*v)*np.exp(-v*(4+i*3))for i,f in enumerate([2480,3150,4760,7100])),.08,.21))
    v=t(.45);save('crack',filtered(noise(len(v)),[1900,7400],'bandpass')*(np.exp(-v*45)+.5*np.exp(-np.maximum(0,v-.14)*45)*(v>.14)))
    v=t(.6);save('rope',filtered(noise(len(v)),[250,2300],'bandpass')*np.sin(np.pi*np.minimum(1,v/.6))**2*.5)
    v=t(.7);save('marble',sum(.14*np.sin(2*np.pi*f*v)*np.exp(-v*(12+i*5))for i,f in enumerate([1800,3150,4500]))+filtered(noise(len(v)),6000)*np.exp(-v*45))
    v=t(.3);save('throw',filtered(noise(len(v)),1800)*np.sin(np.pi*v/.3)**3*.5)
    v=t(3);env=np.sin(np.pi*v/1.5)**4
    save('breath',filtered(noise(len(v)),[300,1900],'bandpass')*env*.24,description='Original designed breathing, no sampled performance')
    for name,notes in [('victory',[261.63,329.63,392,523.25]),('defeat',[146.83,138.59,110,73.42])]:
        v=t(3);s=np.zeros(len(v))
        for i,f in enumerate(notes):
            age=np.maximum(0,v-i*.28);s+=(v>=i*.28)*np.exp(-age*2)*(np.sin(2*np.pi*f*age)+.2*np.sin(4*np.pi*f*age))*.16
        save(name,echo(s),category='music',description='Original four-note cue')
    # Original 16-second seamless minor drone, pulse, strings and detuned glass.
    v=t(16);s=np.zeros(len(v))
    for i,f in enumerate([55,82.4069,110,130.8128,155.5635]):
        s+=(.035*np.sin(2*np.pi*f*v)+.012*np.sin(2*np.pi*(f+.125)*v))*(.65+.35*np.sin(2*np.pi*v/16+i))
    for beat in np.arange(0,16,.8):
        age=np.maximum(0,v-beat);s+=(v>=beat)*np.exp(-age*9)*np.sin(2*np.pi*55*age)*.1
    for i,beat in enumerate(np.arange(0,16,1.6)):
        age=np.maximum(0,v-beat);f=[220,261.63,246.94,207.65,164.81][i%5]
        s+=(v>=beat)*np.exp(-age*3)*(np.sin(2*np.pi*f*age)+.25*np.sin(2*np.pi*f*2.01*age))*.035
    fade=np.minimum(1,np.minimum(v/.1,(16-v)/.15));s*=fade
    save('courtyard-score',np.column_stack([s,np.roll(s,int(SR*.019))]),category='music',description='Original composition: Cour des silences, 16-second stereo loop')

def voices(model):
    from piper import PiperVoice
    from piper.config import SynthesisConfig
    voice=PiperVoice.load(model)
    def synth(text):
        return np.concatenate([c.audio_float_array for c in voice.synthesize(text,SynthesisConfig(length_scale=.92))])
    # A neural French voice on four pitched, stretched syllabic phrases.
    # This is our own chant, not the series recording, voice or melody.
    chant=[]
    for word,duration,pitch in [('Un.',.65,1.12),('Deux.',.65,1.26),('Trois.',.65,1.12),('Soleil !',1.15,.99)]:
        x=synth(word);active=np.flatnonzero(np.abs(x)>.014)
        if len(active):x=x[max(0,active[0]-400):min(len(x),active[-1]+700)]
        with tempfile.TemporaryDirectory() as tmp:
            src=Path(tmp)/'voice.wav';dst=Path(tmp)/'pitched.wav'
            wavfile.write(src,SR,(x*32767).astype(np.int16))
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(src),'-af',f'rubberband=pitch={pitch}:tempo={len(x)/SR/duration}:formant=preserved',str(dst)],check=True)
            _,x=wavfile.read(dst);x=x.astype(float)/32768
        segment=np.zeros(int(SR*(duration+.1)));segment[:min(len(x),len(segment))]=x[:len(segment)]
        chant.append(segment)
    save('doll-chant',np.concatenate(chant),category='voices',description='French neural voice sings Un, deux, trois, soleil, arranged on four original notes')
    lines={'stop':'Ne bougez plus.','ready':'Bienvenue dans la cour des silences.','eliminated':'Joueur éliminé.','qualified':'Épreuve réussie. Préparez-vous pour la suivante.','stage-1':'Découpez le biscuit. Gardez la main calme.','stage-2':'Tirez ensemble, au bon moment.','stage-3':'Trois billes dans le cercle pour survivre.','stage-4':'Choisissez votre dalle. Le verre peut céder.','stage-5':'Dernière épreuve. Rejoignez la sortie.','panic':'Attention ! Ne bougez plus !','scream':'Ah !','gasp':'Oh ! Non !'}
    for name,text in lines.items():save(name,synth(text),category='voices',description='French SIWIS neural voice: '+text)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('model');args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True);effects();voices(args.model)
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'src/audio-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(f'Created {len(manifest)} bundled audio files in {OUT}')
