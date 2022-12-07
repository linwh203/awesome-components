export const KKG =
{
    "nodes": [
      {
        "id": "0",
        "name": "node1",
        "centrality": {
          "degree": 0.4444444444444444,
          "betweenness": 0.023148148148148143,
          "closeness": 0.5294117647058824,
          "eigenvector": 0.35220918419838565
        }
      },
      {
        "id": "1",
        "name": "node2",
        "centrality": {
          "degree": 0.4444444444444444,
          "betweenness": 0.023148148148148143,
          "closeness": 0.5294117647058824,
          "eigenvector": 0.35220918419838565
        }
      },
      {
        "id": "2",
        "name": "node3",
        "centrality": {
          "degree": 0.3333333333333333,
          "betweenness": 0.0,
          "closeness": 0.5,
          "eigenvector": 0.28583482369644964
        }
      },
      {
        "id": "3",
        "name": "node4",
        "centrality": {
          "degree": 0.6666666666666666,
          "betweenness": 0.10185185185185183,
          "closeness": 0.6,
          "eigenvector": 0.481020669200118
        }
      },
      {
        "id": "4",
        "name": "node5",
        "centrality": {
          "degree": 0.3333333333333333,
          "betweenness": 0.0,
          "closeness": 0.5,
          "eigenvector": 0.28583482369644964
        }
      },
      {
        "id": "5",
        "name": "node6",
        "centrality": {
          "degree": 0.5555555555555556,
          "betweenness": 0.23148148148148148,
          "closeness": 0.6428571428571429,
          "eigenvector": 0.3976909028137205
        }
      },
      {
        "id": "6",
        "name": "node7",
        "centrality": {
          "degree": 0.5555555555555556,
          "betweenness": 0.23148148148148148,
          "closeness": 0.6428571428571429,
          "eigenvector": 0.3976909028137205
        }
      },
      {
        "id": "7",
        "name": "node8",
        "centrality": {
          "degree": 0.3333333333333333,
          "betweenness": 0.38888888888888884,
          "closeness": 0.6,
          "eigenvector": 0.19586101425312444
        }
      },
      {
        "id": "8",
        "name": "node9",
        "centrality": {
          "degree": 0.2222222222222222,
          "betweenness": 0.2222222222222222,
          "closeness": 0.42857142857142855,
          "eigenvector": 0.04807425308073236
        }
      },
      {
        "id": "9",
        "name": "node10",
        "centrality": {
          "degree": 0.1111111111111111,
          "betweenness": 0.0,
          "closeness": 0.3103448275862069,
          "eigenvector": 0.011163556091491361
        }
      },
    ],
    "links": [
      {
        "source": "0",
        "target": "1",
        "status": "safe",
      },
      {
        "source": "0",
        "target": "2",
        "status": "safe",
      },
      {
        "source": "0",
        "target": "3",
        "status": "unknown",
      },
      {
        "source": "0",
        "target": "5",
        "status": "broken",
      },
      {
        "source": "1",
        "target": "3",
        "status": "broken",
      },
      {
        "source": "1",
        "target": "4",
        "status": "safe",
      },
      {
        "source": "1",
        "target": "6",
        "status": "unknown",
      },
      {
        "source": "2",
        "target": "3",
        "status": "safe",
      },
      {
        "source": "2",
        "target": "5",
        "status": "safe",
      },
      {
        "source": "3",
        "target": "4",
        "status": "safe",
      },
      {
        "source": "3",
        "target": "5",
        "status": "safe",
      },
      {
        "source": "3",
        "target": "6",
        "status": "safe",
      },
      {
        "source": "4",
        "target": "6",
        "status": "unknown",
      },
      {
        "source": "5",
        "target": "6",
        "status": "unknown",
      },
      {
        "source": "5",
        "target": "7",
        "status": "linked",
      },
      {
        "source": "6",
        "target": "7",
        "status": "safe",
      },
      {
        "source": "7",
        "target": "8",
        "status": "unknown",
      },
      {
        "source": "8",
        "target": "9",
        "status": "linked",
      }
    ]
  }