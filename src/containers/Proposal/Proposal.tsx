import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import Page from 'components/Page'
import { RouteComponentProps } from 'react-router-dom'
import ProposalHero from 'components/ProposalHero'
import { useProposal } from 'store/cache/proposals/hooks'
import { Outcome } from 'types'
import AudiusClient from 'services/Audius'

import VotesTable from 'components/VotesTable'
import { useVotes, useUserVote } from 'store/cache/votes/hooks'
import { GOVERNANCE } from 'utils/routes'

import desktopStyles from './Proposal.module.css'
import mobileStyles from './ProposalMobile.module.css'
import { createStyles } from 'utils/mobile'
import Paper from 'components/Paper'
import Loading from 'components/Loading'
import { IS_PRODUCTION } from 'services/Audius/setup'

const styles = createStyles({ desktopStyles, mobileStyles })

const messages = {
  active: 'Active Proposal',
  resolved: 'Resolved Proposal',
  proposal: '',
  previousPage: 'All Proposals',
  descriptionTitle: 'Description',
  callDataTitle: 'Call Data',
  targetContract: 'Target Contract',
  function: 'Function',
  data: 'Data'
}

const getContractLink = (address: string) => {
  if (IS_PRODUCTION) {
    return `https://etherscan.io/address/${address}`
  }
  return `https://goerli.etherscan.io/address/${address}`
}

type ProposalProps = {} & RouteComponentProps<{ proposalId: string }>
const Proposal: React.FC<ProposalProps> = (props: ProposalProps) => {
  const {
    match: { params }
  } = props
  const proposalId = parseInt(params.proposalId)
  const { proposal } = useProposal(proposalId)
  const { votesFor, votesAgainst } = useVotes(proposalId)
  const { userVote } = useUserVote(proposalId)
  const [callData, setCallData] = useState('')

  const title = proposal
    ? proposal.outcome === Outcome.InProgress
      ? messages.active
      : messages.resolved
    : messages.proposal

  useEffect(() => {
    if (proposal) {
      const types = proposal.functionSignature.split('(')?.[1]?.split(')')?.[0]?.split(',')
      const decoded: {[key: string]: string} = AudiusClient.decodeCallData(types, proposal.callData)
      delete decoded['__length__']
      setCallData(Object.values(decoded).map((v: string) => v.replace(/0+$/, '')).join(','))
    }
  }, [proposal])

  return (
    <Page
      title={title}
      defaultPreviousPage={messages.previousPage}
      defaultPreviousPageRoute={GOVERNANCE}
    >
      <ProposalHero userVote={userVote} proposal={proposal} />
      <Paper className={styles.description}>
        <div className={styles.descriptionTitleContainer}>
          <div className={styles.descriptionTitle}>
            {messages.descriptionTitle}
          </div>
        </div>
        {proposal ? (
          <div className={styles.descriptionBody}>
            <ReactMarkdown plugins={[gfm]} linkTarget="_blank">
              {proposal.description || ''}
            </ReactMarkdown>
          </div>
        ) : (
          <Loading className={styles.loading} />
        )}
      </Paper>
      <Paper className={styles.description}>
        <div className={styles.callDataTitleContainer}>
          <div className={styles.callDataTitle}>
            {messages.callDataTitle}
          </div>
        </div>
        {proposal ? (
          <div className={styles.callDataBody}>
            <div className={styles.targetContract}>
              <p className={styles.callDataSectionHeader}>{messages.targetContract}</p>
              <p className={styles.callDataSectionBody}><a href={getContractLink(proposal.targetContractAddress)} target='_blank' rel="noreferrer">{proposal.targetContractAddress}</a></p>
            </div>
            <div className={styles.function}>
              <p className={styles.callDataSectionHeader}>{messages.function}</p>
              <p className={styles.callDataSectionBody}>{proposal.functionSignature}</p>
            </div>
            <div className={styles.data}>
              <p className={styles.callDataSectionHeader}>{messages.data}</p>
              <p className={styles.callDataSectionBody}>{callData}</p>
            </div>
          </div>
        ) : (
          <Loading className={styles.loading} />
        )}
      </Paper>
      <div className={styles.votes}>
        {<VotesTable title="For" votes={votesFor} />}
        {<VotesTable title="Against" votes={votesAgainst} />}
      </div>
    </Page>
  )
}

export default Proposal
