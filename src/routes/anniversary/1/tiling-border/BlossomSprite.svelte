<svelte:options customElement="blossom-sprite" />

<script lang="ts">
  let { style } = $props();
</script>

<enhanced:img
  src="$lib/assets/frame/cherry-blossom.png"
  sizes="30px"
  alt=""
  style:pointer-events="none"
  style:object-fit="contain"
  style:width={style.width}
  style:height={style.height}
  style:position={style.position}
  style:transform={style.transform}
  style:left={style.left}
  style:right={style.right}
  style:top={style.top}
  style:bottom={style.bottom}
/>
