/** @type {import('./$types').PageLoad} */
export function load() {
	let text: string;

	const common_texts = [
		`Now with<br /><span class="sm:text-sm">multi-file uploads!</span>`,
		`MAKER<br /><span class="sm:text-sm">SPACE!!!</span>`,
		`SPACER<br /><span class="sm:text-sm">MAKE!!!</span>`,
		`So fast!!!`
	];

	const rare_texts = [
		`Bees, bees, bees, bees!`,
		`Any computer is a laptop if you're brave enough`,
		`I'm a computer!`,
		`Rule #1: It's never my fault`,
		`WooWOOooOooOooOOo`,
		`:3`,
		`do you see LA?`,
		`Made by squids :O`,
		`[this splash text is now available]`,
		`Girl moment`,
		`Gay people!!`,
		`this is a really long message that takes up a ton of space on the screen. It's a lot of words! I got really bored when typing this out. I'm not really sure what else to say here, but it still needs to be longer. How is your day, fellow human? Let me know if you read this whole thing! Ping me on discord, I'm @cobular. I really should have gotten chatgpt to write this for me, but you can rest easy knowing that a real human typed out this whole thing. How is your day going? I hope it's going well. Go have fun making something fun today!!`,
		`So fast!!!!!!!!!!!!!!!!!!!!!!!!<br />!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`,
	];

	// 90% chance to choose one from common_texts, 10% chance to choose one from rare_texts
	if (Math.random() < 0.9) {
		// Choose from common_texts
		text = common_texts[Math.floor(Math.random() * common_texts.length)];
	} else {
		// Choose from rare_texts
		text = rare_texts[Math.floor(Math.random() * rare_texts.length)];
	}

	return {
		text
	};
}
