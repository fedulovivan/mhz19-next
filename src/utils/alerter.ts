import { withDebug } from '../logger';
import { asyncTimeout, playAlertSingle } from './';

const debug = withDebug('alerter');

export default class Alerter {
    static repeats = 0;
    static maxRepeats = 15;
    static raised: boolean;
    static playing: boolean;
    static async on() {
        Alerter.repeats = 0;
        Alerter.raised = true;
        while (Alerter.raised && !Alerter.playing && Alerter.repeats < Alerter.maxRepeats) {
            Alerter.playing = true;
            try {
                debug(`Playing alert sound, repeat #${Alerter.repeats + 1}...`);
                await playAlertSingle();
                debug(`Succeeded`);
                Alerter.playing = false;
            } catch (e) {
                debug(`Playing failed`);
                Alerter.playing = false;
            }
            Alerter.repeats += 1;
            if (Alerter.repeats === Alerter.maxRepeats) {
                debug(`Max repeats reached`);
            }
            await asyncTimeout(1000);
        }
    }
    static isRaised() {
        return this.raised;
    }
    static off() {
        Alerter.repeats = 0;
        Alerter.raised = false;
    }
}
