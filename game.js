import React from 'react';
import classNames from 'classnames';

const defaultState = {
    isFirstPlayer: true,
    isGameEnded: false,
    endReason: null
}

var Game = React.createClass({
    getDefaultProps() {
        return {
            rows: 6,
            columns: 7,
            winNum: 4
        }
    },

    getInitialState() {
        return Object.assign({turnes: []}, defaultState);
    },

    onReset(e) {
        e.preventDefault();
        this.setState(Object.assign({turnes: []}, defaultState));
    },

    checkGameEnd() {
        if (Object.keys(this.state.turnes).length >= this.props.rows * this.props.columns) {
            return {isGameEnded: true, endReason: 'fieldSize'};
        } else {
            return false;
        }
    },

    checkWinner(key) {
        let player = this.state.isFirstPlayer ? 'X' : 'O',
            row = 0, col = 0, diag = 0, rDiag = 0,
            rowPrev, colPrev, diagPrev, rDiagPrev,
            cellCol = Number(key.split('')[1], 10),
            cellRow = Number(key.split('')[0], 10);

        //check win row
        for (let i = 0; i < this.props.columns; i++) {
            let id = cellRow.toString() + i.toString(),
            result = {};

            result = this._isPlayerInPoint(id, row, i, rowPrev);

            row = result.counter;
            rowPrev = result.prevPos;
        }

        //check win column
        for (let i = 0; i < this.props.rows; i++) {
            let id = i.toString() + cellCol.toString(),
            result = {};

            result = this._isPlayerInPoint(id, col, i, colPrev);

            col = result.counter;
            colPrev = result.prevPos;
        }

        //check win diag
        let diff = cellRow - cellCol,
            beginColl, beginRow;
        if (diff < 0) {
            beginColl = 0;
            beginRow = Math.abs(diff);;
        } else {
            beginColl = diff;
            beginRow = 0;
        }

        for (let i = 0; i < (this.props.columns - Math.abs(diff)); i++) {
            let id = (beginColl + i).toString() + (beginRow + i).toString(),
            result = {};

            result = this._isPlayerInPoint(id, diag, i, diagPrev);

            diag = result.counter;
            diagPrev = result.prevPos;
        }

        //check win rDiag
        let rSum = cellRow + cellCol,
            rBeginColl, rBeginRow;
        if (rSum >= 5) {
            rBeginColl = cellCol - (5 - cellRow);
            rBeginRow = 5;
        } else {
            rBeginColl = 0;
            rBeginRow = cellCol + cellRow;
        }

        for (let i = 0; ((rBeginRow - i) >= 0) && ((rBeginColl + i) < this.props.rows); i++) {
            let id = (rBeginRow - i).toString() + (rBeginColl + i).toString(),
                result = {};

            result = this._isPlayerInPoint(id, rDiag, i, rDiagPrev);

            rDiag = result.counter;
            rDiagPrev = result.prevPos;
        }

        //check if any condition won
        if (row >= this.props.winNum ||
            col >= this.props.winNum ||
            diag >= this.props.winNum ||
            rDiag >= this.props.winNum) {
                return {isGameEnded: true, endReason: 'playerWin'};
            } else {
                return false;
            }
    },

    _isPlayerInPoint(point, counter, step, prevPos = -1) {
        let player = this.state.isFirstPlayer ? 'X' : 'O';

        if (this.state.turnes[point] == player) {
            if (prevPos == -1) prevPos = step - 1;

            if(step == prevPos + 1) {
                counter++;
            } else {
                counter = 0;
            }
            prevPos = step;
        }

        return { counter, prevPos };
    },

    onTurn(key) {
        let player = this.state.isFirstPlayer ? 'X' : 'O',
            result, isGameEnded;

        this.state.turnes[key] = player;

        result = this.checkWinner(key),
        isGameEnded = this.checkGameEnd();

        if (result) {
            // show game result
            this.setState(result);
        } else if (isGameEnded) {
            // show full field message
            this.setState(isGameEnded);
        } else {
            // next player turn
            this.setState({isFirstPlayer: !this.state.isFirstPlayer});
        }
    },

    render() {
        let itemsEl = [],
            caption = this.state.isFirstPlayer ? 'First' : 'Second',
            captionClasses = classNames({
                'fr-caption': true,
                'fr-caption__first': this.state.isFirstPlayer,
                'fr-caption__second': !this.state.isFirstPlayer
            });

        for (let i = 0; i < this.props.rows; i++) {

            for (let j = 0; j < this.props.columns; j++) {
                let key = i.toString() + j.toString(),
                    classes = classNames({
                        'fr-field__item': true,
                        'fr-field__item_first': this.state.turnes[key] == 'X',
                        'fr-field__item_second': this.state.turnes[key] == 'O'
                    });

                itemsEl.push(<li className={classes} onClick={this.onTurn.bind(this, key)} key={key} />)
            }
        }

        return (
            <div>
                <GameEndMessage
                    isGameEnded={this.state.isGameEnded}
                    endReason={this.state.endReason}
                    isFirstPlayer={this.state.isFirstPlayer}
                    onReset={this.onReset}/>

                <a href='#' className='fr-reset' onClick={this.onReset}>New Game</a>
                <p className={captionClasses}> {caption} player turn: </p>
                <ul className='fr-field'>
                    {itemsEl}
                </ul>
            </div>
        )
    }
});

var GameEndMessage = React.createClass({
    render() {
        let reasons = {
                fieldSize: 'No free space left. Draw!',
                playerWin: (this.props.isFirstPlayer ? 'First' : 'Second') + ' player win!',
            },
            classes = classNames({
                'fr-game-end': true,
                'fr-game-end__show': this.props.isGameEnded

            });

        return (
            <div className={classes}>
                <p>Game end</p>
                <p>{reasons[this.props.endReason]}</p>
                <a href='#' onClick={this.props.onReset} className='fr-game-end__play-again'>Play again</a>
            </div>
        )
    }
});

export default Game;
