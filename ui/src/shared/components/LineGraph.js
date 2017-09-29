import React, {PropTypes, Component} from 'react'
import Dygraph from 'shared/components/Dygraph'
import shallowCompare from 'react-addons-shallow-compare'

import SingleStat from 'src/shared/components/SingleStat'
import timeSeriesToDygraph from 'utils/timeSeriesToDygraph'

import {SINGLE_STAT_LINE_COLORS} from 'src/shared/graphs/helpers'

const {array, arrayOf, bool, func, number, shape, string} = PropTypes

class LineGraph extends Component {
  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  componentWillMount() {
    const {data, activeQueryIndex, isInDataExplorer} = this.props
    this._timeSeries = timeSeriesToDygraph(
      data,
      activeQueryIndex,
      isInDataExplorer
    )
  }

  componentWillUpdate(nextProps) {
    const {data, activeQueryIndex} = this.props
    if (
      data !== nextProps.data ||
      activeQueryIndex !== nextProps.activeQueryIndex
    ) {
      this._timeSeries = timeSeriesToDygraph(
        nextProps.data,
        nextProps.activeQueryIndex,
        nextProps.isInDataExplorer
      )
    }
  }

  render() {
    const {
      data,
      axes,
      cell,
      title,
      onZoom,
      queries,
      timeRange,
      cellHeight,
      ruleValues,
      isBarGraph,
      resizeCoords,
      synchronizer,
      isRefreshing,
      isGraphFilled,
      showSingleStat,
      displayOptions,
      underlayCallback,
      overrideLineColors,
      isFetchingInitially,
    } = this.props

    const {labels, timeSeries, dygraphSeries} = this._timeSeries

    // If data for this graph is being fetched for the first time, show a graph-wide spinner.
    if (isFetchingInitially) {
      return <GraphSpinner />
    }

    const options = {
      labels,
      connectSeparatedPoints: true,
      labelsKMB: true,
      axisLineColor: '#383846',
      gridLineColor: '#383846',
      title,
      rightGap: 0,
      yRangePad: 10,
      axisLabelWidth: 60,
      drawAxesAtZero: true,
      underlayCallback,
      ...displayOptions,
    }

    const lineColors = showSingleStat
      ? SINGLE_STAT_LINE_COLORS
      : overrideLineColors

    return (
      <div className="dygraph graph--hasYLabel" style={{height: '100%'}}>
        {isRefreshing ? <GraphLoadingDots /> : null}
        <Dygraph
          cell={cell}
          axes={axes}
          onZoom={onZoom}
          labels={labels}
          queries={queries}
          timeRange={timeRange}
          isBarGraph={isBarGraph}
          timeSeries={timeSeries}
          ruleValues={ruleValues}
          synchronizer={synchronizer}
          resizeCoords={resizeCoords}
          overrideLineColors={lineColors}
          dygraphSeries={dygraphSeries}
          setResolution={this.props.setResolution}
          containerStyle={{width: '100%', height: '100%'}}
          isGraphFilled={showSingleStat ? false : isGraphFilled}
          options={options}
        />
        {showSingleStat
          ? <SingleStat data={data} cellHeight={cellHeight} />
          : null}
      </div>
    )
  }
}

const GraphLoadingDots = () =>
  <div className="graph-panel__refreshing">
    <div />
    <div />
    <div />
  </div>

const GraphSpinner = () =>
  <div className="graph-fetching">
    <div className="graph-spinner" />
  </div>

LineGraph.defaultProps = {
  underlayCallback: () => {},
  isGraphFilled: true,
  overrideLineColors: null,
}

LineGraph.propTypes = {
  axes: shape({
    y: shape({
      bounds: array,
      label: string,
    }),
    y2: shape({
      bounds: array,
      label: string,
    }),
  }),
  title: string,
  isFetchingInitially: bool,
  isRefreshing: bool,
  underlayCallback: func,
  isGraphFilled: bool,
  isBarGraph: bool,
  overrideLineColors: array,
  showSingleStat: bool,
  displayOptions: shape({
    stepPlot: bool,
    stackedGraph: bool,
  }),
  activeQueryIndex: number,
  ruleValues: shape({}),
  timeRange: shape({
    lower: string.isRequired,
  }),
  isInDataExplorer: bool,
  synchronizer: func,
  setResolution: func,
  cellHeight: number,
  cell: shape(),
  onZoom: func,
  resizeCoords: shape(),
  queries: arrayOf(shape({}).isRequired).isRequired,
  data: arrayOf(shape({}).isRequired).isRequired,
}

export default LineGraph
