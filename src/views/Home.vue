<template>
  <div class="home">
    <div>{{ hello }}</div>
  </div>
</template>

<script>
import helloQuery from '../queries/hello.gql';

export default {
  apollo: {
    hello: {
      query: helloQuery,
    },
  },
  name: 'Home',
};
</script>
