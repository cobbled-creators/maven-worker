import * as handlers from './handlers';
import { factory } from './factory';

export const discord = factory.discord().loader(Object.values(handlers)).fetch;
