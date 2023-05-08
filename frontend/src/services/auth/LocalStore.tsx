class LocalStore 
{
	static getItem(key : string) : string | null {
		return localStorage.getItem(key);
	}

	static setItem(key : string, val : string | null) : void {
		if (val == null)
			localStorage.removeItem(key);
		else
			localStorage.setItem(key, val!);
	}
}

export default LocalStore;