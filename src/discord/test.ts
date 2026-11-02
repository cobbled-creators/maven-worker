import { hashValuesToString } from './handlers/maven/token/util';

class test {
	async hashValues(...args: string[]) {
		return await hashValuesToString(...args);
	}

	constructor() {
		this.hashValues('a', 'b', 'c').then(data => console.log(data))
	}
}


new test();
