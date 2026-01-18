<svelte:options customElement="twig-sprite" />

<script lang="ts">
  let { style } = $props();
</script>

<enhanced:img
  src="$lib/assets/frame/eucalyptus-branch.png?format=avif"
  sizes="150px"
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
