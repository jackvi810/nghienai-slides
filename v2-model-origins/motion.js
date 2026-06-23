// Brutalist Slide Builder - Interactive Widget Library & Motion Engine
(function() {
  window.addEventListener('DOMContentLoaded', () => {
    console.log("Brutalist Motion Engine & Widget Library Loaded.");
    autoInitializeWidgetsGlobal();
    
    // Auto-run if standalone slide (single slide container, e.g. loaded standalone or in deck.html iframe)
    const slides = document.querySelectorAll('.slide-container');
    if (slides.length === 1) {
      const slide = slides[0];
      if (typeof slide.initSlideCharts === 'function') {
        try {
          slide.initSlideCharts();
          console.log("Auto-initialized standalone slide widgets.");
        } catch(e) {
          console.error("Error auto-initializing standalone slide widgets: ", e);
        }
      }
    }
  });

  // Global Auto-Initializer for slide lifecycle hooks
  function autoInitializeWidgetsGlobal() {
    document.querySelectorAll('.slide-container').forEach(slide => {
      // Backup original lifecycle functions if any
      const userInit = slide.initSlideCharts;
      const userDispose = slide.disposeSlideCharts;

      slide.initSlideCharts = function() {
        if (typeof userInit === 'function') userInit();
        initSlideWidgets(slide);
      };

      slide.disposeSlideCharts = function() {
        if (typeof userDispose === 'function') userDispose();
        disposeSlideWidgets(slide);
      };
    });
  }

  // Active timers and simulations references for cleanup
  const activeWidgets = new Map();

  function initSlideWidgets(slide) {
    const slideId = slide.id;
    const slideCleanups = [];
    activeWidgets.set(slideId, slideCleanups);

    // 1. WIDGET: TYPEWRITER TERMINAL (.widget-terminal)
    slide.querySelectorAll('.widget-terminal').forEach(term => {
      const textLines = JSON.parse(term.getAttribute('data-lines') || '[]');
      const delay = parseInt(term.getAttribute('data-delay') || '50');
      term.innerHTML = '';
      term.style.whiteSpace = 'pre-wrap';
      term.style.fontFamily = 'var(--font-mono)';
      
      let lineIdx = 0;
      let charIdx = 0;
      let lineEl = null;

      function typeLine() {
        if (lineIdx >= textLines.length) return;
        lineEl = document.createElement('div');
        term.appendChild(lineEl);
        
        const text = textLines[lineIdx];
        charIdx = 0;

        const interval = setInterval(() => {
          if (charIdx < text.length) {
            lineEl.innerHTML = text.substring(0, charIdx + 1) + '<span class="cursor" style="background:currentColor;color:inherit;display:inline-block;width:8px;height:15px;margin-left:2px;animation: blink 0.8s infinite;">&nbsp;</span>';
            charIdx++;
          } else {
            clearInterval(interval);
            // remove blinking cursor from previous line
            const cursor = lineEl.querySelector('.cursor');
            if (cursor) cursor.remove();
            
            lineIdx++;
            typeLine();
          }
        }, delay);

        slideCleanups.push(() => clearInterval(interval));
      }

      typeLine();
    });

    // 2. WIDGET: 3D CARD FLIPPER (.widget-card-flip)
    slide.querySelectorAll('.widget-card-flip').forEach(flipper => {
      // Ensure CSS styles for 3D card flipping are set
      flipper.style.perspective = '1000px';
      const inner = flipper.querySelector('.card-flip-inner');
      if (inner) {
        inner.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        inner.style.transformStyle = 'preserve-3d';
        inner.style.position = 'relative';
        inner.style.width = '100%';
        inner.style.height = '100%';

        const front = inner.querySelector('.card-flip-front');
        const back = inner.querySelector('.card-flip-back');

        if (front && back) {
          front.style.backfaceVisibility = 'hidden';
          front.style.webkitBackfaceVisibility = 'hidden';
          back.style.backfaceVisibility = 'hidden';
          back.style.webkitBackfaceVisibility = 'hidden';
          back.style.position = 'absolute';
          back.style.top = '0';
          back.style.left = '0';
          back.style.width = '100%';
          back.style.height = '100%';
          back.style.transform = 'rotateY(180deg)';
        }

        let isFlipped = false;
        const toggleFlip = () => {
          isFlipped = !isFlipped;
          inner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0)';
        };

        flipper.addEventListener('click', toggleFlip);
        slideCleanups.push(() => flipper.removeEventListener('click', toggleFlip));
      }
    });

    // 3. WIDGET: PHYSICAL BALANCE SCALE (.widget-balance-scale)
    slide.querySelectorAll('.widget-balance-scale').forEach(scaleEl => {
      const leftWeight = parseFloat(scaleEl.getAttribute('data-left-weight') || '50');
      const rightWeight = parseFloat(scaleEl.getAttribute('data-right-weight') || '50');
      const scaleWidth = 300;
      const scaleHeight = 200;

      // Draw SVG scale
      scaleEl.innerHTML = '';
      const svg = d3.select(scaleEl)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${scaleWidth} ${scaleHeight}`);

      // Calculate tilt angle based on weights (clamp to max 18 degrees)
      const diff = rightWeight - leftWeight;
      const targetAngle = Math.max(-18, Math.min(18, diff * 0.45));

      // Draw Base Triangle
      svg.append('polygon')
        .attr('points', `${scaleWidth/2},${scaleHeight - 10} ${scaleWidth/2 - 25},${scaleHeight} ${scaleWidth/2 + 25},${scaleHeight}`)
        .attr('fill', 'none')
        .attr('stroke', 'var(--color-ink)')
        .attr('stroke-width', '3');

      // Draw Pillar
      svg.append('line')
        .attr('x1', scaleWidth/2)
        .attr('y1', scaleHeight - 10)
        .attr('x2', scaleWidth/2)
        .attr('y2', 50)
        .attr('stroke', 'var(--color-ink)')
        .attr('stroke-width', '4');

      // Beam group for rotation pivot
      const beamG = svg.append('g')
        .attr('transform', `translate(${scaleWidth/2}, 50)`);

      // Draw Beam bar
      const beam = beamG.append('line')
        .attr('x1', -120)
        .attr('y1', 0)
        .attr('x2', 120)
        .attr('y2', 0)
        .attr('stroke', 'var(--color-ink)')
        .attr('stroke-width', '5');

      // Draw Left Scale Pan strings & plate
      const leftPanG = svg.append('g');
      leftPanG.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', -20).attr('y2', 60)
        .attr('stroke', 'var(--color-ink)').attr('stroke-width', '2');
      leftPanG.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', 20).attr('y2', 60)
        .attr('stroke', 'var(--color-ink)').attr('stroke-width', '2');
      leftPanG.append('rect')
        .attr('x', -30).attr('y', 60)
        .attr('width', 60).attr('height', 6)
        .attr('fill', 'var(--color-ink)')
        .attr('stroke', 'var(--color-ink)').attr('stroke-width', '2');

      // Draw Right Scale Pan strings & plate
      const rightPanG = svg.append('g');
      rightPanG.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', -20).attr('y2', 60)
        .attr('stroke', 'var(--color-ink)').attr('stroke-width', '2');
      rightPanG.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', 20).attr('y2', 60)
        .attr('stroke', 'var(--color-ink)').attr('stroke-width', '2');
      rightPanG.append('rect')
        .attr('x', -30).attr('y', 60)
        .attr('width', 60).attr('height', 6)
        .attr('fill', 'var(--color-ink)')
        .attr('stroke', 'var(--color-ink)').attr('stroke-width', '2');

      // Animating the tilt and wobble
      const state = { angle: 0 };
      
      const tl = gsap.timeline();
      tl.to(state, {
        angle: targetAngle,
        duration: 1.5,
        ease: "elastic.out(1.2, 0.4)",
        onUpdate: () => {
          // Tilt the beam
          beamG.attr('transform', `translate(${scaleWidth/2}, 50) rotate(${state.angle})`);
          
          // Calculate the pans positions dynamically to hang vertically
          const rad = (state.angle * Math.PI) / 180;
          const leftX = scaleWidth/2 - 120 * Math.cos(rad);
          const leftY = 50 - 120 * Math.sin(rad);
          
          const rightX = scaleWidth/2 + 120 * Math.cos(rad);
          const rightY = 50 + 120 * Math.sin(rad);

          leftPanG.attr('transform', `translate(${leftX}, ${leftY})`);
          rightPanG.attr('transform', `translate(${rightX}, ${rightY})`);
        }
      });

      slideCleanups.push(() => tl.kill());
    });

    // 4. WIDGET: D3 PHYSICS FORCE NETWORK (.widget-force-graph)
    slide.querySelectorAll('.widget-force-graph').forEach(svgEl => {
      const rawNodes = JSON.parse(svgEl.getAttribute('data-nodes') || '[]');
      const rawLinks = JSON.parse(svgEl.getAttribute('data-links') || '[]');
      
      const width = svgEl.clientWidth || 400;
      const height = svgEl.clientHeight || 300;

      svgEl.innerHTML = '';
      const svg = d3.select(svgEl)
        .attr('viewBox', `0 0 ${width} ${height}`);

      // Deep copies to prevent simulation mutation issues
      const nodes = rawNodes.map(d => ({ ...d }));
      const links = rawLinks.map(d => ({ ...d }));

      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(80))
        .force("charge", d3.forceManyBody().strength(-80))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(22));

      // Draw links
      const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "var(--color-ink)")
        .attr("stroke-width", 2.5);

      // Draw node groups
      const node = svg.append("g")
        .selectAll(".node-group")
        .data(nodes)
        .join("g")
        .attr("class", "node-group")
        .call(d3.drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
        );

      node.append("circle")
        .attr("r", 16)
        .attr("fill", d => d.color || "var(--color-yellow)")
        .attr("stroke", "var(--color-ink)")
        .attr("stroke-width", 2);

      node.append("text")
        .text(d => d.label || d.id)
        .attr("text-anchor", "middle")
        .attr("dy", ".33em")
        .attr("fill", "var(--color-ink)")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", "10px")
        .attr("font-weight", "bold");

      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node.attr("transform", d => `translate(${d.x}, ${d.y})`);
      });

      slideCleanups.push(() => simulation.stop());
    });

    // 5. WIDGET: LIQUID WAVE GAUGE (.widget-liquid-gauge)
    slide.querySelectorAll('.widget-liquid-gauge').forEach(gaugeEl => {
      const fillPercent = parseFloat(gaugeEl.getAttribute('data-value') || '50');
      const size = 150;
      const radius = size / 2;

      gaugeEl.innerHTML = '';
      const svg = d3.select(gaugeEl)
        .append('svg')
        .attr('width', size)
        .attr('height', size)
        .attr('viewBox', `0 0 ${size} ${size}`);

      // Draw outer circle container
      svg.append('circle')
        .attr('cx', radius)
        .attr('cy', radius)
        .attr('r', radius - 4)
        .attr('fill', 'none')
        .attr('stroke', 'var(--color-ink)')
        .attr('stroke-width', '4');

      // Clip path for liquid
      const clip = svg.append('defs')
        .append('clipPath')
        .attr('id', `${slideId}-liquid-clip`);
      
      clip.append('circle')
        .attr('cx', radius)
        .attr('cy', radius)
        .attr('r', radius - 6);

      // Draw sloshing wave inside clip path
      const liquidG = svg.append('g')
        .attr('clip-path', `url(#${slideId}-liquid-clip)`);

      const wavePath = liquidG.append('path')
        .attr('fill', 'var(--color-yellow)')
        .attr('stroke', 'var(--color-ink)')
        .attr('stroke-width', 2);

      // Liquid value text display
      const text = svg.append('text')
        .text(`${fillPercent}%`)
        .attr('x', radius)
        .attr('y', radius + 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '28px')
        .attr('font-weight', '900')
        .attr('font-family', 'var(--font-display)')
        .attr('fill', 'var(--color-ink)');

      // Wave physics parameters
      const waveHeight = 6;
      const waveLength = 100;
      let offset = 0;

      const fillY = size - (fillPercent / 100) * size;

      function updateWave() {
        const points = [];
        for (let x = 0; x <= size; x += 4) {
          const y = fillY + Math.sin((x / waveLength) * 2 * Math.PI + offset) * waveHeight;
          points.push([x, y]);
        }
        points.push([size, size]);
        points.push([0, size]);

        const lineGen = d3.line();
        wavePath.attr('d', lineGen(points));
        offset += 0.08;
      }

      const timer = d3.timer(updateWave);
      slideCleanups.push(() => timer.stop());
    });

    // 6. WIDGET: INTERACTIVE FLOW DIAGRAM (.widget-flow-diagram)
    slide.querySelectorAll('.widget-flow-diagram').forEach(container => {
      const rawNodes = JSON.parse(container.getAttribute('data-nodes') || '[]');
      const rawEdges = JSON.parse(container.getAttribute('data-edges') || '[]');
      const rawFlows = JSON.parse(container.getAttribute('data-flows') || '{}');
      
      const width = 800;
      const height = 450;
      
      container.innerHTML = '';
      container.style.position = 'relative';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      
      // Top bar for flow buttons
      const bar = document.createElement('div');
      bar.className = 'flow-bar';
      bar.style.display = 'flex';
      bar.style.gap = '8px';
      bar.style.padding = '8px';
      bar.style.borderBottom = '2px solid var(--color-ink)';
      bar.style.background = 'rgba(0,0,0,0.03)';
      container.appendChild(bar);
      
      // Add "Everything" button
      const allBtn = document.createElement('button');
      allBtn.textContent = 'All Nodes';
      allBtn.style.padding = '4px 10px';
      allBtn.style.border = '1.5px solid var(--color-ink)';
      allBtn.style.background = 'var(--color-yellow)';
      allBtn.style.fontFamily = 'var(--font-mono)';
      allBtn.style.fontSize = '12px';
      allBtn.style.fontWeight = 'bold';
      allBtn.style.cursor = 'pointer';
      bar.appendChild(allBtn);
      
      const flowButtons = [];
      
      // SVG stage
      const svg = d3.select(container)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '300px')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('border', '2px solid var(--color-ink)')
        .style('background', 'var(--color-paper)');
        
      // Define markers
      const defs = svg.append('defs');
      defs.append('marker')
        .attr('id', `${slideId}-arrow-muted`)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', '8')
        .attr('refY', '5')
        .attr('markerWidth', '6')
        .attr('markerHeight', '6')
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', 'M 0,1.5 L 8,5 L 0,8.5 z')
        .attr('fill', 'var(--color-muted)');
        
      defs.append('marker')
        .attr('id', `${slideId}-arrow-lit`)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', '8')
        .attr('refY', '5')
        .attr('markerWidth', '6')
        .attr('markerHeight', '6')
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', 'M 0,1.5 L 8,5 L 0,8.5 z')
        .attr('fill', 'var(--color-accent)');

      // Draw Edges (Paths)
      const edgeGroup = svg.append('g').attr('class', 'edges');
      const edgeElements = {};
      rawEdges.forEach(e => {
        const path = edgeGroup.append('path')
          .attr('d', e.d)
          .attr('fill', 'none')
          .attr('stroke', 'var(--color-muted)')
          .attr('stroke-width', 2.5)
          .attr('marker-end', `url(#${slideId}-arrow-muted)`);
          
        edgeElements[e.id] = path;
      });

      // Draw Nodes (Groups)
      const nodeGroup = svg.append('g').attr('class', 'nodes');
      const nodeElements = {};
      rawNodes.forEach(n => {
        const g = nodeGroup.append('g')
          .attr('class', 'node')
          .attr('transform', `translate(${n.x}, ${n.y})`)
          .style('cursor', 'pointer');
          
        g.append('rect')
          .attr('width', n.w || 120)
          .attr('height', n.h || 50)
          .attr('rx', 6)
          .attr('fill', 'var(--color-paper)')
          .attr('stroke', 'var(--color-ink)')
          .attr('stroke-width', 2);
          
        g.append('text')
          .text(n.label)
          .attr('x', (n.w || 120) / 2)
          .attr('y', (n.h || 50) / 2 + 5)
          .attr('text-anchor', 'middle')
          .attr('font-family', 'var(--font-display)')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .attr('fill', 'var(--color-ink)');
          
        nodeElements[n.id] = g;
        
        // Click details event
        g.on('click', () => {
          showDetailCard(n.label, n.desc || 'No description provided.');
        });
      });

      // Bottom floating details card
      const detail = document.createElement('div');
      detail.style.padding = '8px 12px';
      detail.style.fontFamily = 'var(--font-mono)';
      detail.style.fontSize = '12px';
      detail.style.borderTop = '2px solid var(--color-ink)';
      detail.style.background = 'var(--color-paper)';
      detail.innerHTML = `<strong>Details:</strong> Click any node or flow to view steps.`;
      container.appendChild(detail);
      
      function showDetailCard(title, text) {
        detail.innerHTML = `<strong>\${title}:</strong> \${text}`;
      }

      function setFlow(flowKey) {
        // Reset styles
        allBtn.style.background = 'transparent';
        flowButtons.forEach(btn => btn.style.background = 'transparent');
        
        // Reset all nodes/edges
        Object.keys(nodeElements).forEach(id => {
          nodeElements[id].select('rect').attr('stroke', 'var(--color-ink)').attr('fill', 'var(--color-paper)');
          nodeElements[id].style('opacity', flowKey === 'all' ? 1 : 0.35);
        });
        Object.keys(edgeElements).forEach(id => {
          edgeElements[id]
            .attr('stroke', 'var(--color-muted)')
            .attr('marker-end', `url(#\${slideId}-arrow-muted)`)
            .style('stroke-dasharray', 'none')
            .style('animation', 'none')
            .style('opacity', flowKey === 'all' ? 1 : 0.2);
        });

        if (flowKey === 'all') {
          allBtn.style.background = 'var(--color-yellow)';
          showDetailCard('Overview', 'Click on a path flow button at the top to animate specific sequences.');
          return;
        }

        const flow = rawFlows[flowKey];
        if (!flow) return;

        // Highlight active button
        const activeBtn = flowButtons.find(btn => btn.dataset.flow === flowKey);
        if (activeBtn) activeBtn.style.background = 'var(--color-yellow)';

        // Highlight flow nodes/edges
        flow.nodes.forEach(id => {
          if (nodeElements[id]) {
            nodeElements[id].style('opacity', 1);
            nodeElements[id].select('rect').attr('stroke', 'var(--color-accent)');
          }
        });
        
        flow.edges.forEach(id => {
          if (edgeElements[id]) {
            edgeElements[id]
              .style('opacity', 1)
              .attr('stroke', 'var(--color-accent)')
              .attr('marker-end', `url(#\${slideId}-arrow-lit)`)
              .style('stroke-dasharray', '8, 5')
              .style('animation', 'flow-march 0.8s linear infinite');
          }
        });

        // Output flow description steps
        const stepsHtml = flow.steps ? flow.steps.map((s, i) => `\${i+1}. \${s}`).join(' | ') : 'Running flow...';
        showDetailCard(flow.name || flowKey, stepsHtml);
      }

      // Populate flow buttons
      Object.keys(rawFlows).forEach(key => {
        const btn = document.createElement('button');
        btn.dataset.flow = key;
        btn.textContent = rawFlows[key].name || key;
        btn.style.padding = '4px 10px';
        btn.style.border = '1.5px solid var(--color-ink)';
        btn.style.background = 'transparent';
        btn.style.fontFamily = 'var(--font-mono)';
        btn.style.fontSize = '12px';
        btn.style.fontWeight = 'bold';
        btn.style.cursor = 'pointer';
        
        btn.addEventListener('click', () => setFlow(key));
        bar.appendChild(btn);
        flowButtons.push(btn);
      });

      allBtn.addEventListener('click', () => setFlow('all'));
      
      // Inject flow march keyframe animation once
      if (!document.getElementById('flow-march-animation-style')) {
        const style = document.createElement('style');
        style.id = 'flow-march-animation-style';
        style.innerHTML = `
          @keyframes flow-march {
            to { stroke-dashoffset: -13; }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Default set all active
      setFlow('all');
    });
  }

  function disposeSlideWidgets(slide) {
    const slideId = slide.id;
    const cleanups = activeWidgets.get(slideId);
    if (cleanups) {
      cleanups.forEach(fn => fn());
      activeWidgets.delete(slideId);
      console.log(`Disposed widgets for slide: ${slideId}`);
    }
  }
})();
