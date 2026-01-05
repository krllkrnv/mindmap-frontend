<template>
  <div class="mindmap-container" ref="containerEl">
    <div class="header">
      <h1>Граф связей терминов</h1>
      <button @click="$router.push('/terms')" class="btn btn-secondary">
        Назад к списку
      </button>
    </div>

    <div v-if="loading" class="loading">Загрузка графа...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <svg v-else ref="svgEl" class="mindmap-svg"></svg>
    <div v-show="!loading && !error" class="controls">
      <button @click="zoomIn" class="control-btn" title="Приблизить">+</button>
      <button @click="zoomOut" class="control-btn" title="Отдалить">−</button>
      <button @click="resetZoom" class="control-btn" title="Сбросить зум">⊙</button>
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

// Router
const router = useRouter()

// UI state
const loading = ref(false)
const error = ref('')

// Refs
const containerEl = ref(null)
const svgEl = ref(null)

// Dimensions
const width = ref(800)
const height = ref(600)

// D3 state
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
  
  // Подготавливаем данные с начальными координатами (размещение по кругу)
  const nodes = terms.map((t, i) => {
    // Размещаем узлы по кругу для начального распределения
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


  // Создаем SVG
  if (!d3Svg) {
    d3Svg = d3.select(svgEl.value)
      .attr('width', width.value)
      .attr('height', height.value)
      .attr('viewBox', `0 0 ${width.value} ${height.value}`)
  }

  // Очищаем предыдущий граф
  d3Svg.selectAll('*').remove()

  // Создаем defs для маркеров стрелок
  const defs = d3Svg.append('defs')
  
  // Создаем маркер-стрелку
  const arrowMarker = defs.append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 40)  // Расстояние от конца линии до начала стрелки (радиус узла + небольшой отступ)
    .attr('refY', 0)
    .attr('markerWidth', 10)
    .attr('markerHeight', 10)
    .attr('orient', 'auto')
  
  arrowMarker.append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#999')
    .attr('stroke', 'none')

  // Создаем главную группу для всего графа (для зума)
  const mainGroup = d3Svg.append('g').attr('class', 'main-group')
  
  // Создаем группы для линий и узлов (правильный порядок!)
  const linkGroup = mainGroup.append('g').attr('class', 'links')
  const nodeGroup = mainGroup.append('g').attr('class', 'nodes')

  // Создаем линии ПЕРВЫМИ (они будут под узлами)
  const lines = linkGroup.selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-width', 1.5)
    .attr('opacity', 0.6)
    .attr('marker-end', 'url(#arrowhead)')  // Добавляем стрелку на конце линии
    // Устанавливаем начальные координаты
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)

  // Создаем узлы ПОВЕРХ линий
  const circles = nodeGroup.selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 35)  // Увеличили с 20 до 35
    .attr('fill', '#3498db')
    .attr('stroke', '#000')
    .attr('stroke-width', 3)  // Увеличили обводку с 2 до 3
    // Устанавливаем начальные координаты!
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
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
  
  // Создаем кастомный tooltip в DOM (не в SVG!)
  const tooltip = d3.select('body').append('div')
    .attr('class', 'mindmap-tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.9)')
    .style('color', 'white')
    .style('padding', '10px')
    .style('border-radius', '6px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 1000)
    .style('max-width', '300px')
    .style('white-space', 'pre-line')
    .style('font-family', 'Arial, sans-serif')

  // Находим полный объект термина для отображения источников
  const getFullTerm = (nodeId) => terms.find(t => t.id === nodeId)
  
  // Добавляем события для мгновенного показа tooltip
  circles
    .on('mouseenter', function(event, d) {
      const fullTerm = getFullTerm(d.id)
      let tooltipContent = `${d.term}\n\n${d.definition}\n\nКатегория: ${d.category}`
      
      if (fullTerm && fullTerm.sources && fullTerm.sources.length > 0) {
        tooltipContent += '\n\nИсточники:'
        fullTerm.sources.forEach(source => {
          tooltipContent += `\n${source.citation} ${source.full}`
        })
      }
      
      tooltip
        .style('opacity', 1)
        .html(tooltipContent)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
    })
    .on('mousemove', function(event) {
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
    })
    .on('mouseleave', function() {
      tooltip.style('opacity', 0)
    })

  // Создаем текстовые метки для терминов
  const labels = nodeGroup.selectAll('text')
    .data(nodes)
    .join('text')
    .text(d => d.term)
    .attr('x', d => d.x)
    .attr('y', d => d.y + 50)  // Увеличили отступ с 35 до 50
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')  // Увеличили шрифт с 12px до 14px
    .attr('font-weight', 'bold')
    .attr('fill', '#2c3e50')
    .style('pointer-events', 'none')  // Текст не мешает клику на узел

  // Создаем группу для меток связей (чтобы фон и текст были вместе)
  const linkLabelGroup = linkGroup.selectAll('g.link-label-group')
    .data(links)
    .join('g')
    .attr('class', 'link-label-group')
    .style('pointer-events', 'none')

  // Создаем фон для текста
  const linkLabelBgs = linkLabelGroup.append('rect')
    .attr('class', 'link-label-bg')
    .attr('fill', 'rgba(255, 255, 255, 0.95)')
    .attr('stroke', '#ccc')
    .attr('stroke-width', 1)
    .attr('rx', 4)
    .attr('height', 20)

  // Создаем текстовые метки на дугах (связях)
  const linkLabels = linkLabelGroup.append('text')
    .attr('class', 'link-label')
    .text(d => d.relationType || '')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '11px')
    .attr('fill', '#555')
    .attr('font-weight', '500')
    .style('user-select', 'none')

  // Добавляем зум и панорамирование
  zoomBehavior = d3.zoom()
    .scaleExtent([0.1, 4])  // Минимальный и максимальный зум
    .on('zoom', (event) => {
      mainGroup.attr('transform', event.transform)
    })
  
  d3Svg.call(zoomBehavior)
  
  // Создаем симуляцию с оптимальными расстояниями
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(200))  // Увеличили расстояние между связанными узлами
    .force('charge', d3.forceManyBody().strength(-2000))  // Увеличили отталкивание для большего пространства
    .force('center', d3.forceCenter(width.value / 2, height.value / 2).strength(0.1))  // Слабее притяжение к центру
    .force('collision', d3.forceCollide().radius(100))  // Увеличили радиус коллизии для предотвращения наложения
    .alphaDecay(0.01)  // Медленнее затухание для более плавной анимации
    .alpha(1)  // Начать с полной энергии
    .velocityDecay(0.5)  // Больше трение для стабильности

  // Функция для вычисления позиции текста на середине дуги
  const getLinkLabelPosition = (link) => {
    const dx = link.target.x - link.source.x
    const dy = link.target.y - link.source.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)
    
    // Позиция на середине дуги
    const midX = (link.source.x + link.target.x) / 2
    const midY = (link.source.y + link.target.y) / 2
    
    return { x: midX, y: midY, angle: angle }
  }

  // Обновляем позиции при каждом тике
  simulation.on('tick', () => {
    lines
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    circles
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)

    labels
      .attr('x', d => d.x)
      .attr('y', d => d.y + 50)

    // Обновляем позиции текстовых меток на дугах
    linkLabelGroup.each(function(d) {
      const pos = getLinkLabelPosition(d)
      const group = d3.select(this)
      
      // Получаем размеры текста для фона
      const textElement = group.select('text.link-label').node()
      if (textElement) {
        const bbox = textElement.getBBox()
        const padding = 4
        
        // Обновляем фон
        group.select('rect.link-label-bg')
          .attr('x', pos.x - bbox.width / 2 - padding)
          .attr('y', pos.y - bbox.height / 2 - padding)
          .attr('width', bbox.width + padding * 2)
          .attr('height', bbox.height + padding * 2)
        
        // Обновляем текст
        group.select('text.link-label')
          .attr('x', pos.x)
          .attr('y', pos.y)
      }
    })
  })

}

// Функции управления зумом
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
    const terms = dataService.getAllTerms()
    if (terms.length === 0) {
      error.value = 'Нет терминов для отображения'
      return
    }
    loading.value = false  // Сначала убираем loading
    await nextTick()        // Ждём, пока Vue обновит DOM и покажет SVG
    buildGraph(terms)       // Теперь SVG точно в DOM
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
  // Очищаем tooltip при размонтировании
  d3.selectAll('.mindmap-tooltip').remove()
})
</script>

<style scoped>
.mindmap-container {
  position: relative;
  height: 70vh;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  background: #f8f9fa;
  overflow: hidden;
}

.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e0e0e0;
  z-index: 20;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.mindmap-svg {
  width: 100%;
  height: 100%;
  display: block;
  background: #f8f9fa;
}

.mindmap-svg :deep(text) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
}

.mindmap-svg :deep(circle:hover) {
  fill: #2980b9;
  stroke-width: 4;
}

.controls {
  position: absolute;
  top: 100px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.control-btn {
  width: 36px;
  height: 36px;
  border: 2px solid #3498db;
  background: white;
  border-radius: 8px;
  font-size: 20px;
  font-weight: bold;
  color: #3498db;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: #3498db;
  color: white;
  transform: scale(1.1);
}

.control-btn:active {
  transform: scale(0.95);
}

.hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(44, 62, 80, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
  text-align: center;
}

.loading, .error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.error { color: #e74c3c; }
</style>
