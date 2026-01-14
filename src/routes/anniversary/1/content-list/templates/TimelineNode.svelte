<script lang="ts">
  interface Props {
    title: string;
    description?: string;
    date?: string;
    icon?: string;
    color?: string;
    size?: "small" | "medium" | "large";
    badge?: string | number | undefined;
    onClick?: ((event: MouseEvent) => void) | undefined;
  }

  let {
    title,
    description = "",
    date = "",
    icon = "",
    color = "#4299e1",
    size = "medium",
    badge = undefined,
    onClick = undefined,
  }: Props = $props();

  interface SizeConfig {
    width: string;
    height: string;
    fontSize: string;
    badgeSize: string;
  }

  const sizeMap: Record<"small" | "medium" | "large", SizeConfig> = {
    small: {
      width: "60px",
      height: "60px",
      fontSize: "12px",
      badgeSize: "20px",
    },
    medium: {
      width: "80px",
      height: "80px",
      fontSize: "14px",
      badgeSize: "24px",
    },
    large: {
      width: "100px",
      height: "100px",
      fontSize: "16px",
      badgeSize: "28px",
    },
  };

  function handleClick(event: MouseEvent): void {
    if (onClick) {
      onClick(event);
    }
  }
</script>

<div
  class="timeline-node"
  style="--node-color: {color};"
  on:click={handleClick}
>
  <div
    class="node-circle"
    style="width: {sizeMap[size].width}; height: {sizeMap[size].height};"
    aria-label={`Timeline event: ${title || date}`}
  >
    {#if icon}
      <div class="node-icon">{icon}</div>
    {:else if date}
      <div class="node-date">{date}</div>
    {:else}
      <div class="node-default">{title?.charAt(0) || "?"}</div>
    {/if}

    {#if badge !== undefined}
      <div
        class="node-badge"
        style="width: {sizeMap[size].badgeSize}; height: {sizeMap[size]
          .badgeSize};"
      >
        {badge}
      </div>
    {/if}
  </div>

  <div class="node-content" style="font-size: {sizeMap[size].fontSize};">
    {#if title}
      <h3 class="node-title">{title}</h3>
    {/if}
    {#if description}
      <p class="node-description">{description}</p>
    {/if}
  </div>
</div>

<style>
  .timeline-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    position: relative;
  }

  .node-circle {
    background: var(--node-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    position: relative;
  }

  .node-circle:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .node-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #e53e3e;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7em;
    font-weight: bold;
    border: 2px solid white;
  }

  .node-content {
    text-align: center;
    max-width: 200px;
    background: white;
    padding: 8px 12px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .node-title {
    margin: 0 0 4px 0;
    color: #2d3748;
    font-weight: 600;
  }

  .node-description {
    margin: 0;
    color: #4a5568;
    font-size: 0.9em;
    line-height: 1.4;
  }

  .node-date {
    font-size: 0.9em;
  }

  .node-default {
    font-size: 1.2em;
  }
</style>
