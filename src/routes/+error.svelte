<script lang="ts">
  import tapirWalk from "$lib/assets/misc/nimi-nightmare-tapir.gif";
  import tapirPads from "$lib/assets/misc/nimi-nightmare-tapir-pads.gif";
  let hover: boolean = $state(false);
  let currentTapir = $derived(hover ? tapirPads : tapirWalk);
</script>

<main class={["relative", "h-screen", "w-screen"]}>
  <div class={["absolute", "left-0", "right-0", "top-1/3", "bottom-0"]}>
    <div class={["flex", "h-1/3", "justify-center"]}>
      <div class={["flex", "items-center", "flex-col", "space-y-2"]}>
        <div class={["text-3xl"]}>
          nothing to see here, keep on wandering!! :3
        </div>

        <div class={["text-xl"]}>
          but wait! no one should have to frolic alone ٩(^ᴗ^)۶
        </div>

        <div class={["flex", "items-center", "flex-col"]}>
          <img
            width={200}
            height={200}
            onmouseover={() => (hover = true)}
            onmouseout={() => (hover = false)}
            onfocus={() => (hover = true)}
            onblur={() => (hover = false)}
            alt="nimi tapir walking"
            src={currentTapir}
          />
        </div>
        <p class={["opacity-25", "text-xs"]}>(hover for head pads)</p>
      </div>
    </div>
  </div>
</main>

<style>
  :root {
    background-color: #fdfdfd;
  }
</style>
