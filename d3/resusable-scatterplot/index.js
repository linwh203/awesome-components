import { scatterPlot } from "./scatterPlot.js"
import {menuChart} from './menuChart.js'
const { csv , select} = d3

const width = window.innerWidth
const height = window.innerHeight

const csvUrl = [
    'https://gist.githubusercontent.com/',
    'curran/a08a1080b88344b0c8a7/',
    'raw/0e7a9b0a5d22642a06d3d5b9bcbad9890c8ee534/',
    'iris.csv'
].join('')

// "sepal_length","sepal_width","petal_length","petal_width" parse String to Number
const parseRow = (d) => {
    d.sepal_length = +d.sepal_length
    d.sepal_width = +d.sepal_width
    d.petal_length = +d.petal_length
    d.petal_width = +d.petal_width
    return d
}

const svg = select('body').append('svg')
    .attr('width', width)
    .attr('height', height)

const getDataAndRender = async () => { 
    const plot = scatterPlot()
                    .width(width).height(height)
                    .data(await csv(csvUrl, parseRow))
                    .xValue(d => d.petal_width)
                    .yValue(d => d.sepal_length)
                    .symbolValue(d => d.species)
                    .margin({
                        top: 50,
                        right: 50,
                        bottom: 50,
                        left: 50,
                    })
                    .size(100)
    svg.call(plot)

    let i = 0
    const colums = [
        'petal_width',
        'petal_length',
        'sepal_width',
        'sepal_length',
    ]
    // setInterval(() => {
    //     plot.xValue(d => d[colums[i % colums.length]] )
    //     svg.call(plot)
    //     i++
    // }, 1500)
    const menuContainer = select('menu-container')
    const xMenu = menuContainer.append('div')
    const yMenu = menuContainer.append('div')

    xMenu.call(menuChart().id('x-menu').labelText('X:'))
    yMenu.call(menuChart().id('y-menu').labelText('Y:'))
}


getDataAndRender()