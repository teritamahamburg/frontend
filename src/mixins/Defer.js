export default function (count = 10) {
  // @vue/component
  return {
    data() {
      return {
        displayPriority: 0,
      };
    },

    mounted() {
      this.runDisplayPriority();
    },

    methods: {
      runDisplayPriority() {
        const step = () => {
          requestAnimationFrame(() => {
            this.displayPriority += 1;
            if (this.displayPriority < count) {
              step();
            }
          });
        };
        step();
      },

      defer(priority) {
        return this.displayPriority >= priority;
      },
    },
  };
}
