<template>
  <div class="mindmap-wrapper">
    <div class="mindmap-container" ref="containerEl">
      <div v-if="loading" class="loading" role="status" aria-live="polite">Загрузка графа...</div>
      <div v-else-if="error" class="error" role="alert" aria-live="assertive">{{ error }}</div>
      <svg v-else ref="svgEl" class="mindmap-svg" role="img" aria-label="Граф связей терминов"></svg>
      <div v-show="!loading && !error" class="controls" role="toolbar" aria-label="Элементы управления графом">
        <button @click="zoomIn" class="control-btn" title="Приблизить" aria-label="Приблизить граф">+</button>
        <button @click="zoomOut" class="control-btn" title="Отдалить" aria-label="Отдалить граф">−</button>
        <button @click="resetZoom" class="control-btn" title="Сбросить зум" aria-label="Сбросить масштаб графа">⊙</button>
      </div>
    </div>
    <div v-show="!loading && !error" class="hint">
      Прокрутка: зум • Перетаскивание фона: панорамирование • Перетаскивание узлов: перемещение
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as d3 from 'd3'
import dataService from '../services/data.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const containerEl = ref(null)
const svgEl = ref(null)
const width = ref(800)
const height = ref(600)
let d3Svg = null
let simulation = null
let zoomBehavior = null

const measureContainer = () => {
  if (!containerEl.value) return
  const rect = containerEl.value.getBoundingClientRect()
  width.value = Math.max(300, rect.width)
  height.value = Math.max(300, rect.height)
  if (d3Svg) {
    d3Svg.attr('width', width.value).attr('height', height.value)
  }
}

const buildGraph = (terms) => {
  const nodes = terms.map((t, i) => {
    const angle = (i / terms.length) * 2 * Math.PI
    const radius = Math.min(width.value, height.value) * 0.3
    return {
      id: t.id,
      term: t.term,
      definition: t.definition,
      category: t.category,
      x: width.value / 2 + Math.cos(angle) * radius,
      y: height.value / 2 + Math.sin(angle) * radius
    }
  })

  const links = []
  terms.forEach(t => {
    (t.relations || []).forEach(relation => {
      const target = terms.find(x => x.term === relation.term)
      if (target) {
        const sourceNode = nodes.find(n => n.id === t.id)
        const targetNode = nodes.find(n => n.id === target.id)
        if (sourceNode && targetNode) {
          links.push({ 
            source: sourceNode, 
            target: targetNode,
            relationType: relation.type
          })
        }
      }
    })
  })

  if (!d3Svg) {
    d3Svg = d3.select(svgEl.value)
      .attr('width', width.value)
      .attr('height', height.value)
      .attr('viewBox', `0 0 ${width.value} ${height.value}`)
  }

  d3Svg.selectAll('*').remove()

  const maxNodeDistance = Math.max(...nodes.map(n => {
    const width = Math.max(80, n.term.length * 8 + 20)
    const height = 40
    return Math.sqrt((width / 2) ** 2 + (height / 2) ** 2)
  }))
  
  const refX = maxNodeDistance * 0.4

  const defs = d3Svg.append('defs')
  const arrowMarker = defs.append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', refX)
    .attr('refY', 0)
    .attr('markerWidth', 10)
    .attr('markerHeight', 10)
    .attr('orient', 'auto')
  
  arrowMarker.append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#718096')
    .attr('stroke', 'none')

  const mainGroup = d3Svg.append('g').attr('class', 'main-group')
  const linkGroup = mainGroup.append('g').attr('class', 'links')
  const nodeGroup = mainGroup.append('g').attr('class', 'nodes')

  const lines = linkGroup.selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#718096')
    .attr('stroke-width', 1)
    .attr('opacity', 0.5)
    .attr('marker-end', 'url(#arrowhead)')
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

  const nodeGroups = nodeGroup.selectAll('g.node-group')
    .data(nodes)
    .join('g')
    .attr('class', 'node-group')
    .attr('transform', d => `translate(${d.x},${d.y})`)
    .style('cursor', 'grab')
    .call(d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
        event.sourceEvent.target.style.cursor = 'grabbing'
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
        event.sourceEvent.target.style.cursor = 'grab'
      })
    )

  const nodeWidth = 120
  
  const rects = nodeGroups.append('rect')
    .attr('width', nodeWidth)
    .attr('height', 40)
    .attr('x', -nodeWidth / 2)
    .attr('y', -20)
    .attr('rx', 3)
    .attr('fill', '#2c5282')
    .attr('stroke', '#1a365d')
    .attr('stroke-width', 1)

  const labels = nodeGroups.append('foreignObject')
    .attr('width', nodeWidth)
    .attr('height', 40)
    .attr('x', -nodeWidth / 2)
    .attr('y', -20)
    .style('pointer-events', 'none')
    .append('xhtml:div')
    .style('width', `${nodeWidth}px`)
    .style('padding', '10px 8px')
    .style('font-size', '13px')
    .style('font-weight', '600')
    .style('color', '#ffffff')
    .style('text-align', 'center')
    .style('word-wrap', 'break-word')
    .style('line-height', '1.4')
    .style('pointer-events', 'none')
    .text(d => d.term)

  setTimeout(() => {
    nodeGroups.each(function() {
      const div = d3.select(this).select('div').node()
      if (div) {
        const height = div.offsetHeight
        d3.select(this).select('rect')
          .attr('height', height)
          .attr('y', -height / 2)
        d3.select(this).select('foreignObject')
          .attr('height', height)
          .attr('y', -height / 2)
      }
    })
  }, 0)

  const tooltip = d3.select('body').append('div')
    .attr('class', 'mindmap-tooltip')
    .style('position', 'absolute')
    .style('background', '#1a202c')
    .style('color', '#f7fafc')
    .style('padding', '12px 16px')
    .style('border-radius', '4px')
    .style('font-size', '13px')
    .style('font-family', 'sans-serif')
    .style('line-height', '1.6')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 1000)
    .style('max-width', '320px')
    .style('white-space', 'pre-line')
    .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
    .style('border', '1px solid #2d3748')

  nodeGroups
    .on('mouseenter', function(event, d) {
      d3.select(this).select('rect')
        .attr('fill', '#1a365d')
        .attr('stroke-width', 1.5)
      
      const highlightedLinks = lines
        .filter(link => link.source.id === d.id)
        .attr('stroke', '#2c5282')
        .attr('stroke-width', 1)
        .attr('opacity', 0.9)
      
      linkLabelGroup
        .filter(link => link.source.id === d.id)
        .select('rect.link-label-bg')
        .attr('fill', '#edf2f7')
        .attr('stroke', '#2c5282')
        .attr('stroke-width', 1.5)
      
      linkLabelGroup
        .filter(link => link.source.id === d.id)
        .select('text.link-label')
        .attr('fill', '#1a365d')
        .attr('font-weight', '600')
      
      tooltip
        .style('opacity', 1)
        .html(d.definition)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
    })
    .on('mousemove', function(event) {
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
    })
    .on('mouseleave', function(event, d) {
      d3.select(this).select('rect')
        .attr('fill', '#2c5282')
        .attr('stroke-width', 1)
      
      lines
        .filter(link => link.source.id === d.id)
        .attr('stroke', '#718096')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5)
      
      linkLabelGroup
        .filter(link => link.source.id === d.id)
        .select('rect.link-label-bg')
        .attr('fill', '#ffffff')
        .attr('stroke', '#cbd5e0')
        .attr('stroke-width', 0.5)
      
      linkLabelGroup
        .filter(link => link.source.id === d.id)
        .select('text.link-label')
        .attr('fill', '#4a5568')
        .attr('font-weight', '500')
      
      tooltip.style('opacity', 0)
    })
    .on('click', function(event, d) {
      event.stopPropagation()
      router.push(`/terms/${d.id}`)
    })

  const linkLabelGroup = linkGroup.selectAll('g.link-label-group')
    .data(links)
    .join('g')
    .attr('class', 'link-label-group')
    .style('pointer-events', 'none')

  const linkLabelBgs = linkLabelGroup.append('rect')
    .attr('class', 'link-label-bg')
    .attr('fill', '#ffffff')
    .attr('stroke', '#cbd5e0')
    .attr('stroke-width', 0.5)
    .attr('rx', 3)
    .attr('height', 20)

  const linkLabels = linkLabelGroup.append('text')
    .attr('class', 'link-label')
    .text(d => d.relationType || '')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '11px')
    .attr('fill', '#4a5568')
    .attr('font-weight', '500')
    .style('user-select', 'none')

  zoomBehavior = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      mainGroup.attr('transform', event.transform)
    })
  
  d3Svg.call(zoomBehavior)
  
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(200))
    .force('charge', d3.forceManyBody().strength(-2000))
    .force('center', d3.forceCenter(width.value / 2, height.value / 2).strength(0.1))
    .force('collision', d3.forceCollide().radius(d => {
      const textLength = d.term.length
      const width = Math.max(80, textLength * 8 + 20)
      return Math.sqrt(width * width + 40 * 40) / 2 + 10
    }))
    .alphaDecay(0.0228)
    .alpha(1)
    .velocityDecay(0.4)
    .stop()

  for (let i = 0; i < 300; i++) {
    simulation.tick()
  }

  simulation.alpha(0.1).restart()

  const getLinkLabelPosition = (link) => {
    const dx = link.target.x - link.source.x
    const dy = link.target.y - link.source.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)
    const midX = (link.source.x + link.target.x) / 2
    const midY = (link.source.y + link.target.y) / 2
    
    return { x: midX, y: midY, angle: angle }
  }

  simulation.on('tick', () => {
    lines
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    nodeGroups
      .attr('transform', d => `translate(${d.x},${d.y})`)

    linkLabelGroup.each(function(d) {
      const pos = getLinkLabelPosition(d)
      const group = d3.select(this)
      const textElement = group.select('text.link-label').node()
      if (textElement) {
        const bbox = textElement.getBBox()
        const padding = 4
        
        group.select('rect.link-label-bg')
          .attr('x', pos.x - bbox.width / 2 - padding)
          .attr('y', pos.y - bbox.height / 2 - padding)
          .attr('width', bbox.width + padding * 2)
          .attr('height', bbox.height + padding * 2)
        
        group.select('text.link-label')
          .attr('x', pos.x)
          .attr('y', pos.y)
      }
    })
  })

}

const zoomIn = () => {
  if (d3Svg && zoomBehavior) {
    d3Svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.3)
  }
}

const zoomOut = () => {
  if (d3Svg && zoomBehavior) {
    d3Svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.7)
  }
}

const resetZoom = () => {
  if (d3Svg && zoomBehavior) {
    d3Svg.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity)
  }
}

const loadTerms = async () => {
  try {
    loading.value = true
    error.value = ''
    const terms = await dataService.getAllTerms()
    if (terms.length === 0) {
      error.value = 'Нет терминов для отображения'
      return
    }
    loading.value = false
    await nextTick()
    buildGraph(terms)
  } catch (e) {
    error.value = 'Ошибка загрузки терминов'
    console.error(e)
    loading.value = false
  }
}

onMounted(async () => {
  await nextTick()
  measureContainer()
  if (svgEl.value) {
    await loadTerms()
  }
  window.addEventListener('resize', measureContainer)
})

onUnmounted(() => {
  window.removeEventListener('resize', measureContainer)
  if (simulation) simulation.stop()
  d3.selectAll('.mindmap-tooltip').remove()
})
</script>

<style lang="scss" scoped>

.mindmap-wrapper {
  display: flex;
  flex-direction: column;
}

.mindmap-container {
  position: relative;
  height: 70vh;
  border: 0.05rem solid $color-border;
  border-radius: $radius-md;
  background: $color-background-cream;
  overflow: hidden;
}

.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  @include flex-between;
  padding: $spacing-2xl;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(1rem);
  border-bottom: 0.1rem solid $color-border-dark;
  z-index: 20;
}

.header h1 {
  margin: 0;
  color: $color-text-primary;
  font-size: $font-size-lg;
}

.btn {
  @include button-base;
}

.btn-secondary {
  background-color: $color-secondary;
  color: $color-white;
}

.btn-secondary:hover {
  background-color: $color-secondary-hover;
}

.mindmap-svg {
  width: 100%;
  height: 100%;
  display: block;
  background: $color-background-cream;
}

.mindmap-svg :deep(text) {
  user-select: none;
}


.controls {
  position: absolute;
  top: 1rem;
  right: 1.6rem;
  display: flex;
  gap: $spacing-xl;
  z-index: 10;
}

.control-btn {
  width: 3.2rem;
  height: 3.2rem;
  border: 0.05rem solid $color-primary;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-radius: $radius-sm;
  font-size: 1.6rem;
  font-weight: 600;
  color: $color-primary;
  cursor: pointer;
  @include transition;
  @include flex-center;
  box-shadow: $shadow-sm;
}

.control-btn:hover {
  background: $color-primary;
  color: $color-white;
  box-shadow: $shadow-md;
}

.control-btn:active {
  transform: translateY(0.1rem);
  outline: none !important;
}

.control-btn:focus {
  outline: none !important;
}

.hint {
  margin-top: $spacing-xl;
  text-align: center;
  color: $color-text-tertiary;
  font-size: $font-size-md;
  padding: $spacing-md $spacing-2xl;
  font-style: italic;
}

.loading, .error {
  position: absolute;
  inset: 0;
  @include flex-center;
  font-size: $font-size-md;
}

.error {
  color: $color-error;
}

@media (min-width: 48.1rem) and (max-width: 76.8rem) {
  .mindmap-container {
    height: 65vh;
  }
  
  .controls {
    top: 1rem;
    right: 1rem;
  }
  
  .control-btn {
    width: 3rem;
    height: 3rem;
    font-size: 1.5rem;
  }
}

@media (max-width: 48rem) {
  .mindmap-container {
    height: 60vh;
  }
  
  .controls {
    top: 0.5rem;
    right: 0.5rem;
    gap: $spacing-md;
  }
  
  .control-btn {
    width: 2.8rem;
    height: 2.8rem;
    font-size: 1.4rem;
  }
  
  .hint {
    font-size: $font-size-xs;
    padding: $spacing-sm $spacing-lg;
  }
}
</style>
