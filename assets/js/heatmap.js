// import * as d3 from 'd3'
// import {
//   downloadable
// } from 'd3-downloadable'

// d3.select('svg#heatmap-main')
//   .call(downloadable());

drawHeatmap = layout => {
  const width = document.getElementById('heatmap-main').clientWidth;
  const height = document.getElementById('heatmap-main').clientHeight;
  const margin = {
    top: height * 0.05,
    bottom: height * 0.05,
    left: width * 0.05,
    right: width * 0.05
  };
  const colsize = select_col.value;
  const rowsize = select_row.value;

  // const colsize = textarea_col.value;
  // const rowsize = textarea_row.value;


  const blocksize = (width - margin.left - margin.right) / colsize;

  d3.json(layout).then(data => {
    d3.select('svg').remove(); // erase previous svg
    for (i in data) {
      data[i].col = i % colsize + 1;
      // data[i].row = i % rowsize + 1;

    }
    const letters = Array.from(textarea_main.value);
    // console.log('letters : ', letters);
    let matched, current, prev, home = [];
    const homerow = [3];
    const homecol = [2, 3, 4, 5, 8, 9, 10, 11];
    const calcRelpos = (d, i) => Math.sqrt((d.row - i.row) ** 2 + (d.col - i.col) ** 2);

    /* COUNT COST */
    for (i in data)
      data[i].count = 0;
    for (j in letters)
      for (i in data)
        if (letters[j].toUpperCase() == data[i].char)
          data[i].count++;

    /* DISTANCE COST */
    // for (j in letters) {
    //   for (i in data) {
    //     // if (i == letters[0]) matched.push(data[i]);
    //     if (letters[j].toUpperCase() == data[i].char) {
    //       prev.push(current.length != 0 ? current : data[i])
    //       current.push(data[i])
    //       console.log('current: ', current);
    //       console.log('prev: ', prev);
    //       data[i].dist = calcRelpos(current.shift(), prev.shift());
    //       console.log(`data[${i}].dist: `, data[i].dist);
    //       // if (letters[0]) prevc.push(data[i])
    // if (letters[j] == letters[0]) matched.push(data[i]);
    // console.log(Array.of(data[i].dist));
    //     }
    //   }
    // }




    // console.log(matched);
    // console.log(matched.length);

    // for (i in matched) {
    //   current = data[i]
    //   prev = data.length ? data[data.length - 1] : current
    //   data[i].dist = calcRelpos(current, prev);
    //   console.log(`data[${i}].dist: `, data[i].dist);
    // }


    // console.log(`data[${i}].dist: `, data[i].dist.toFixed(1));
    // data[i].dist = (data[i] != data[0]) ? calcRelpos(, data[i]) : 0;

    // for (j in letters)
    //   for (i in data)
    //     if (letters[j].toUpperCase() == data[i].char)
    //       matched.push(data[i]);
    // console.log('matched: ', matched);

    // for (i in data) data[i].dist = 0;
    // for (j in matched) {
    //   for (i in data) {
    //     if (matched[j] == data[i])
    //       data[i].dist = calcRelpos(matched[j], data[i]);
    //   }
    //   console.log('data[i].dist: ', data[i].dist);
    // }

    /* POSITION COST */
    for (i in data)
      if (homerow.includes(data[i].row) && homecol.includes(data[i].col))
        home.push(data[i]);
    for (i in data) {
      data[i].sum = 0;
      for (j in home)
        data[i].sum += calcRelpos(home[j], data[i]);
      data[i].pos = data[i].sum / home.length;
    }

    /* CALC AND SCALE */
    for (i in data) data[i].cost = (data[i].count * data[i].pos);
    const costmin = Math.min.apply(null, data.map(d => d.cost));
    const costmax = Math.max.apply(null, data.map(d => d.cost));
    const costScale = d3.scaleLinear().domain([costmin, costmax]).range([0, 10]);
    for (i in data) data[i].cost = costScale(data[i].cost).toFixed(0);

    /* CREATE SCALE */
    const countmin = Math.min.apply(null, data.map(d => d.count));
    const countmax = Math.max.apply(null, data.map(d => d.count));
    const colorScale = d3.scaleLinear().domain([countmin, countmax]).range(['#F2F1EF', '#F22613']);

    /* DRAG BEHAVIOR */
    //this = nodes[i] !=document.getElementById('keys')

    const dragstarted = (d, i, nodes) => {
      d3.select(nodes[i]).raise().classed('active', true).select('rect').attr('fill', 'aquamarine');
    }

    const dragged = (d, i, nodes) => {
      d3.select(nodes[i]).select('rect')
        .attr('x', (d.x = d3.event.x))
        .attr('y', (d.y = d3.event.y))
        .attr(
          'transform',
          `translate(-${margin.left + blocksize / 2}, -${margin.top +
            blocksize / 2})`

        );
      d3.select(nodes[i]).selectAll('text.char')
        .attr('x', (d.x = d3.event.x))
        .attr('y', (d.y = d3.event.y))
        .attr(
          'transform',
          `translate(-${margin.left + blocksize / 2}, -${margin.top +
            blocksize / 2})`
        );
      d3.select(nodes[i]).selectAll('text.count')
        .attr('x', (d.x = d3.event.x))
        .attr('y', (d.y = d3.event.y))
        .attr(
          'transform',
          `translate(-${margin.left + blocksize / 2}, -${margin.top +
            blocksize / 2})`
        );
      d3.select(nodes[i]).selectAll('text.cost')
        .attr('x', (d.x = d3.event.x))
        .attr('y', (d.y = d3.event.y))
        .attr(
          'transform',
          `translate(-${margin.left + blocksize / 2}, -${margin.top +
            blocksize / 2})`
        );
    }

    const dragended = (d, i, nodes) => {
      d3
        .select(nodes[i])
        .classed('active', false)
        .select('rect').attr('fill', d => (d.char && check_color.checked ? colorScale(d.count) : '#FFF'));
    }

    const drag = d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);

    const easeKeys = (d, i, nodes) => {
      console.log('nodes[i]: ', nodes[i]);
      d3.select(nodes[i])
        .transition()
        // .delay((d, i)=>{ return i * 100 })
        .duration(300)
        .ease(d3.easeExpOut)
        .attr('rx', 30)
        .attr('ry', 30)
        .transition()
        .duration(200)
        .ease(d3.easeExpOut)
        .attr('rx', 10)
        .attr('ry', 10);
    }

    /* DRAW HEATMAP */
    const svg = d3.select('#heatmap-main')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('font-family', 'Arial')

    const keys = d3
      .select('svg')
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('id', 'key')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .call(drag)
      .on('click', (d, i, nodes) => {
        // if (d3.event.defaultPrevented) return; // click suppressed
        textarea_main.value += data[i].char;
        count_char.innerHTML = 'Char...' + countChar(textarea_main.value);
        drawHeatmap(layout);
        easeKeys(d, i, nodes);
      });

    keys
      .append('rect')
      .attr('x', (d, i) => blocksize * (i % colsize))
      .attr('y', (d, i) => blocksize * (data[i].row - 1))
      .attr('width', blocksize)
      .attr('height', blocksize)
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('fill', d => (d.char && check_color.checked ? colorScale(d.count) : '#FFF'))
      .style('opacity', 0.9)
      .attr('stroke', '#ccc')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', '1')
      .attr('cursor', 'move')
    // .on('mouseover', (d, i, nodes) => {
    // d3.select(nodes[i]).select('rect').attr('class', 'selected')
    // console.log('keys: ', keys.rect);
    // })
    // .on('click', (d, i, nodes) => {})

    keys
      .append('text')
      .attr('class', 'char')
      .text(d => d.char)
      .attr('x', (d, i) => blocksize * (i % colsize))
      .attr('y', (d, i) => blocksize * (data[i].row - 1))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('dx', blocksize / 2)
      .attr('dy', blocksize / 2)
      .attr('fill', 'black')
      .style('font-size', blocksize * 0.3)

    keys
      .append('text')
      .attr('class', 'count')
      // .text(d => (d.char && d.count != 0 ? d.count : ''))
      .text(d => (check_count.checked && d.count != 0 ? d.count : ''))
      .attr('x', (d, i) => blocksize * (i % colsize))
      .attr('y', (d, i) => blocksize * (data[i].row - 1))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('dx', blocksize * 0.75)
      .attr('dy', blocksize * 0.75)
      .attr('fill', 'black')
      .style('font-size', blocksize * 0.2)


    keys
      .append('text')
      .attr('class', 'cost')
      .text(d => (check_cost.checked && d.cost != 0 ? d.cost : ''))
      .attr('x', (d, i) => blocksize * (i % colsize))
      .attr('y', (d, i) => blocksize * (data[i].row - 1))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('dx', blocksize * 0.25)
      .attr('dy', blocksize * 0.25)
      .attr('fill', 'black')
      .style('font-size', blocksize * 0.2)
    // .style('font-weight', 'bold')
    keys
      .append('text')
      .text(d => `C${d.col}`)
      .attr('x', (d, i) => blocksize * (i % colsize + 0.5))
      .attr('y', 0)
      .attr('fill', '#333')
      .style('font-size', blocksize * 0.2)
      .style('text-anchor', 'middle')
      .attr('transform', `translate(${0}, ${0})`);

    keys
      .append('text')
      .text(d => `R${rowsize-(d.row-1)}`)
      .attr('fill', '#333')
      .attr('x', 0)
      .attr('y', (d, i) => blocksize * (data[i].row - 0.5))
      .style('font-size', blocksize * 0.2)
      .style('text-anchor', 'end')
      .attr('transform', `translate(${0}, ${0})`);
  });
};

//TODO
// var zoom = d3.behavior.zoom()
//     .translate(d3.select('svg').enter().translate())
//     .scale(d3.select('svg').scale())
//     .scaleExtent([height, 8 * height])
//     .on('zoom', zoomed);

//TODO
// const arr = (new Array(4)).fill(1).map((v, i) => v + i)
// console.log(arr);
// console.log(data[1].row);
// console.log(() => (d){return d.ro/w});
// const row = data.map(() => (d){ return d.row; })
// for(let k in data) {
//   if(data.hasOwnProperty(k)) {
//     console.log(k+ ':' + data[k]);
// }
//   }
