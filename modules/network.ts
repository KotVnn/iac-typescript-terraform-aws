import { Construct } from 'constructs';
import { TerraformOutput } from 'cdktf';
import {Vpc} from '@cdktf/provider-aws/lib/vpc';
import {InternetGateway} from '@cdktf/provider-aws/lib/internet-gateway';
import {Subnet} from '@cdktf/provider-aws/lib/subnet';
import {Eip} from '@cdktf/provider-aws/lib/eip';
import {NatGateway} from '@cdktf/provider-aws/lib/nat-gateway';
import {RouteTable} from '@cdktf/provider-aws/lib/route-table';
import {Route} from '@cdktf/provider-aws/lib/route';
import {RouteTableAssociation} from '@cdktf/provider-aws/lib/route-table-association';

export interface NetworkModuleProps {
	region: string;
	cidrBlock: string;
	publicSubnetIps: string[];
	privateSubnetIps: string[];
	availabilityZone1: string;
	availabilityZone2: string;
}

export class NetworkModule extends Construct {
	public readonly myVpc: Vpc;
	constructor(scope: Construct, id: string, props: NetworkModuleProps) {
		super(scope, id);
		
		// Create VPC
		this.myVpc = new Vpc(this, 'MyVpc', {
			cidrBlock: props.cidrBlock,
			enableDnsHostnames: true,
			tags: {
				Name: 'AHT Kot Demo VPC'
			}
		});
		
		// Create Internet Gateway
		const myIgw = new InternetGateway(this, 'MyIgw', {
			vpcId: this.myVpc.id
		});
		
		// Create Public Subnets
		const publicSubnet1 = new Subnet(this, 'PublicSubnet1', {
			vpcId: this.myVpc.id,
			cidrBlock: props.publicSubnetIps[0],
			availabilityZone: props.availabilityZone1,
			tags: {
				Name: 'AHT Kot Public Subnet 1'
			}
		});
		
		const publicSubnet2 = new Subnet(this, 'PublicSubnet2', {
			vpcId: this.myVpc.id,
			cidrBlock: props.publicSubnetIps[1],
			availabilityZone: props.availabilityZone2,
			tags: {
				Name: 'AHT Kot Public Subnet 2'
			}
		});
		
		// Create Private Subnets
		const privateSubnet1 = new Subnet(this, 'PrivateSubnet1', {
			vpcId: this.myVpc.id,
			cidrBlock: props.privateSubnetIps[0],
			availabilityZone: props.availabilityZone1,
			tags: {
				Name: 'AHT Kot Private Subnet 1'
			}
		});
		
		const privateSubnet2 = new Subnet(this, 'PrivateSubnet2', {
			vpcId: this.myVpc.id,
			cidrBlock: props.privateSubnetIps[1],
			availabilityZone: props.availabilityZone2,
			tags: {
				Name: 'AHT Kot Private Subnet 2'
			}
		});
		
		// Create EIP for NAT Gateway
		const natEip = new Eip(this, 'NatEip', {});
		
		// Create NAT Gateway
		const natGateway = new NatGateway(this, 'NatGateway', {
			allocationId: natEip.id,
			subnetId: publicSubnet1.id
		});
		
		// Create Public Route Table
		const publicRouteTable = new RouteTable(this, 'PublicRouteTable', {
			vpcId: this.myVpc.id,
			tags: {
				Name: 'AHT Kot Public RTB'
			}
		});
		
		new Route(this, 'PublicRoute', {
			routeTableId: publicRouteTable.id,
			destinationCidrBlock: '0.0.0.0/0',
			gatewayId: myIgw.id
		});
		
		// Create Private Route Table
		const privateRouteTable = new RouteTable(this, 'PrivateRouteTable', {
			vpcId: this.myVpc.id,
			tags: {
				Name: 'AHT Kot Private RTB'
			}
		});
		
		new Route(this, 'PrivateRoute', {
			routeTableId: privateRouteTable.id,
			destinationCidrBlock: '0.0.0.0/0',
			natGatewayId: natGateway.id
		});
		
		// Associate Private Subnets with Private Route Table
		new RouteTableAssociation(this, 'PrivateSubnetAssociation1', {
			subnetId: privateSubnet1.id,
			routeTableId: privateRouteTable.id
		});
		
		new RouteTableAssociation(this, 'PrivateSubnetAssociation2', {
			subnetId: privateSubnet2.id,
			routeTableId: privateRouteTable.id
		});
		
		// Associate Public Subnets with Public Route Table
		new RouteTableAssociation(this, 'PublicSubnetAssociation1', {
			subnetId: publicSubnet1.id,
			routeTableId: publicRouteTable.id
		});
		
		new RouteTableAssociation(this, 'PublicSubnetAssociation2', {
			subnetId: publicSubnet2.id,
			routeTableId: publicRouteTable.id
		});
		
		// Outputs
		new TerraformOutput(this, 'vpcId', {
			value: this.myVpc.id
		});
		
		new TerraformOutput(this, 'publicSubnet1Id', {
			value: publicSubnet1.id
		});
		
		new TerraformOutput(this, 'publicSubnet2Id', {
			value: publicSubnet2.id
		});
		
		new TerraformOutput(this, 'privateSubnet1Id', {
			value: privateSubnet1.id
		});
		
		new TerraformOutput(this, 'privateSubnet2Id', {
			value: privateSubnet2.id
		});
	}
}
