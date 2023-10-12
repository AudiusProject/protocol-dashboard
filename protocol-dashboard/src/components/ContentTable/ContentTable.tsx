import React, { useCallback } from 'react'
import { usePushRoute } from 'utils/effects'

import { ContentNode, Address, Status } from 'types'
import { SERVICES_CONTENT, contentNodePage } from 'utils/routes'

import ServiceTable from 'components/ServiceTable'
import { useContentNodes } from 'store/cache/contentNode/hooks'

const messages = {
  title: 'Content Nodes',
  viewMore: 'View All Content Nodes'
}

type OwnProps = {
  className?: string
  limit?: number
  owner?: Address
  alwaysShowMore?: boolean
}

type ContentTableProps = OwnProps
const ContentTable: React.FC<ContentTableProps> = ({
  className,
  limit,
  owner,
  alwaysShowMore
}: ContentTableProps) => {
  const { nodes, status } = useContentNodes({ owner })
  const pushRoute = usePushRoute()

  const onClickMore = useCallback(() => {
    pushRoute(SERVICES_CONTENT)
  }, [pushRoute])

  const onRowClick = useCallback(
    (row: ContentNode) => {
      pushRoute(contentNodePage(row.spID))
    },
    [pushRoute]
  )

  return (
    <ServiceTable
      className={className}
      isLoading={status === Status.Loading}
      title={messages.title}
      data={nodes}
      limit={limit}
      onRowClick={onRowClick}
      onClickMore={limit ? onClickMore : undefined}
      moreText={limit ? messages.viewMore : undefined}
      alwaysShowMore={alwaysShowMore}
    />
  )
}

export default ContentTable
