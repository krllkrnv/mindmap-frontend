<template>
  <div class="term-card">
    <div class="term-header">
      <h3 class="term-title">{{ term.term }}</h3>
      <span v-if="term.category" class="term-category">{{ term.category }}</span>
    </div>
    
    <p class="term-definition">{{ term.definition }}</p>
    
    <div v-if="term.relations && term.relations.length > 0" class="related-terms">
      <strong>Связанные термины:</strong>
      <div v-for="(relation, index) in term.relations" :key="index" class="relation-item">
        <span class="relation-type">{{ relation.type }}:</span>
        <span class="related-tag">{{ relation.term }}</span>
      </div>
    </div>
    
    <div v-if="term.sources && term.sources.length > 0" class="sources">
      <strong>Источники:</strong>
      <div v-for="(source, index) in term.sources" :key="index" class="source-item">
        <span class="citation-badge">{{ source.citation }}</span>
        <span class="source-text">{{ source.full }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  term: {
    type: Object,
    required: true
  }
})


</script>

<style scoped>
.term-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.term-card:hover {
  /* Убрали все hover эффекты */
}

.term-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.term-title {
  color: #2c3e50;
  margin: 0;
  font-size: 1.3em;
  font-weight: bold;
}

.term-category {
  background: #3498db;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
}

.term-definition {
  color: #555;
  line-height: 1.6;
  margin-bottom: 15px;
}

.related-terms {
  margin-bottom: 15px;
}

.related-terms strong {
  color: #2c3e50;
  margin-right: 8px;
  display: block;
  margin-bottom: 8px;
}

.relation-item {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.relation-type {
  color: #7f8c8d;
  font-size: 0.85em;
  font-style: italic;
}

.related-tag {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  display: inline-block;
}

.sources {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.sources strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 10px;
}

.source-item {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.citation-badge {
  background: #3498db;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 600;
  flex-shrink: 0;
}

.source-text {
  color: #555;
  font-size: 0.85em;
  line-height: 1.5;
  flex: 1;
}

</style>
