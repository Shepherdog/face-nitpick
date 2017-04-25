// Make a store for the "global"

module.exports = {
	// You must define the name of the individual store
	name: "global",

	// The state of the global
	state: {
		amount: 0
	},

	/**
	 * All actions to mutate the state
	 */
	add_item: function(item) {
		this.state.amount += item.amount;
	}
};