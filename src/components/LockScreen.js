import styled from 'styled-components'
import posed from 'react-pose'
import React, { Component, Fragment } from 'react'
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import DoneIcon from '@material-ui/icons/Done'
import { TextField, Button } from '@material-ui/core'
import FormControl from '@material-ui/core/FormControl'
import crypto from 'crypto'
import cryptojs from 'crypto-js'

const LockScreenRoot = styled(
  posed.div({
    visible: { y: '0%', scale: 1, opacity: 1 },
    collapse: {
      y: '100%',
      scale: 0,
      opacity: 0.5
    }
  })
)`
  height: 100%;
  width: 100%;
  position: fixed;
  display: flex;
  flex-direction: column;
  background: white;
  z-index: 1;
  top: 0;
  left: 0;
`

class LockScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      password: ''
    }
  }

  componentDidMount = () => {
    setTimeout(() => {
      document.querySelector('#lock_password').focus()
    }, 300)
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  }

  handleVerification = () => {
    const { password } = this.state
    const {
      pwdTarget,
      saltTarget,
      cipherTarget,
      accList,
      currAcc,
      updateEosProvider,
      updateAccountName,
      loadAccountInfo
    } = this.props

    if (password && pwdTarget && saltTarget && cipherTarget && accList && currAcc) {
      crypto.pbkdf2(password, saltTarget, 123948, 64, 'sha512', (err, key) => {
        const base64Key = key.toString('base64')

        if (base64Key === pwdTarget) {
          var bytes = cryptojs.AES.decrypt(cipherTarget, password)
          var plaintext = bytes.toString(cryptojs.enc.Utf8)
          updateEosProvider({ keyProvider: plaintext })
          updateAccountName({ accountName: currAcc })
          loadAccountInfo()
          this.handleClose()
        } else {
          this.setState({
            message: 'password is incorrect!',
            showError: true
          })
        }
      })
    }
  }

  handleClose = () => {
    const { closeLockScreen } = this.props
    closeLockScreen()

    this.setState({
      message: '',
      showError: false
    })
  }

  handleReset = () => {
    localStorage.clear()

    this.handleClose()
  }

  handleKeyDown = e => {
    if (e.keyCode === 13) {
      this.handleVerification()
    } else if (e.keyCode === 9) {
      e.preventDefault()
    }
  }

  render() {
    const { password } = this.state
    const { show } = this.props

    return (
      <LockScreenRoot pose={show} onKeyDown={this.handleKeyDown}>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="title" color="inherit">
              Unlock Account
            </Typography>
          </Toolbar>
        </AppBar>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography style={{ paddingTop: '16px' }} gutterBottom variant="title" component="h2">
            Enter your password
          </Typography>

          <FormControl fullWidth>
            <TextField
              style={{ marginLeft: '24px', marginRight: '24px' }}
              id="lock_password"
              type="password"
              label="Password"
              placeholder="Password"
              margin="normal"
              value={password}
              disabled={show === 'collapse' ? true : false}
              onChange={this.handleChange('password')}
            />
          </FormControl>
        </div>

        <div style={{ flexGrow: 0, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            style={{ marginLeft: '16px', marginBottom: '16px' }}
            variant="fab"
            color="secondary"
            disabled={show === 'collapse' ? true : false}
            onClick={this.handleReset}
          >
            <DeleteForeverIcon />
          </Button>
          <Button
            style={{ marginRight: '16px', marginBottom: '16px' }}
            variant="fab"
            color="primary"
            disabled={show === 'collapse' ? true : false}
            onClick={this.handleVerification}
          >
            <DoneIcon />
          </Button>
        </div>
      </LockScreenRoot>
    )
  }
}

export default LockScreen
